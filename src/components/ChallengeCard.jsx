import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronsRight, Star, CheckCircle2, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';

export default function ChallengeCard({ challenge, completedTasksCount, isClaimed, onClaim, onProgressUpdate }) {
    const { t, isRTL } = useLanguage();
    const [progressInput, setProgressInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isProgressTracking = challenge.type === 'progress_tracking';
    const isUnlocked = isProgressTracking 
        ? (challenge.current_progress || 0) >= (challenge.target_value || 0)
        : completedTasksCount >= challenge.required_completions;
    
    const progressPercentage = isProgressTracking
        ? Math.min(((challenge.current_progress || 0) / (challenge.target_value || 1)) * 100, 100)
        : Math.min((completedTasksCount / challenge.required_completions) * 100, 100);

    const handleProgressSubmit = async (e) => {
        e.preventDefault();
        if (!progressInput || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const value = parseFloat(progressInput);
            if (isNaN(value) || value <= 0) {
                alert(isRTL ? 'אנא הזן ערך תקין' : 'Please enter a valid value');
                return;
            }

            const user = await base44.auth.me();
            const today = new Date().toISOString().split('T')[0];

            // Create progress entry
            await base44.entities.ChallengeProgress.create({
                challenge_id: challenge.id,
                child_profile_id: challenge.child_profile_id,
                progress_value: value,
                progress_date: today,
                family_id: user.family_id
            });

            // Update challenge progress
            const newProgress = (challenge.current_progress || 0) + value;
            await base44.entities.Challenge.update(challenge.id, {
                current_progress: newProgress
            });

            setProgressInput('');
            if (onProgressUpdate) onProgressUpdate();
        } catch (error) {
            console.error('Error submitting progress:', error);
            alert(isRTL ? 'שגיאה בשמירת ההתקדמות' : 'Error saving progress');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            className={`p-3 md:p-4 rounded-xl shadow-md border-2 ${isClaimed ? 'bg-gray-100 border-gray-200' : 'bg-white'}`}
            whileHover={{ scale: isClaimed ? 1 : 1.02 }}
        >
            <div className="flex items-start gap-2 md:gap-4">
                <div className="p-2 md:p-3 bg-indigo-100 rounded-full flex-shrink-0">
                    <ChevronsRight className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
                </div>
                <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm md:text-base">{challenge.title}</h4>
                    <p className="text-xs md:text-sm text-gray-600">{challenge.description}</p>
                    
                    {!isClaimed && (
                        <>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 my-3">
                                <motion.div
                                    className="bg-indigo-500 h-2.5 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 0.5 }}
                                ></motion.div>
                            </div>
                            {isProgressTracking ? (
                                <>
                                    <p className="text-xs text-gray-500 mb-3">
                                        {t('progress')}: {(challenge.current_progress || 0).toFixed(1)}/{challenge.target_value} {challenge.tracking_unit}
                                    </p>
                                    <form onSubmit={handleProgressSubmit} className="flex gap-2 mb-3">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            placeholder={isRTL ? `כמה ${challenge.tracking_unit} היום?` : `How many ${challenge.tracking_unit} today?`}
                                            value={progressInput}
                                            onChange={(e) => setProgressInput(e.target.value)}
                                            className="h-9 text-sm"
                                            disabled={isSubmitting}
                                        />
                                        <Button 
                                            type="submit" 
                                            size="sm" 
                                            disabled={isSubmitting || !progressInput}
                                            className="bg-blue-500 hover:bg-blue-600"
                                        >
                                            <TrendingUp className="w-4 h-4" />
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                <p className="text-xs text-gray-500 mb-3">
                                    {t('progress')}: {completedTasksCount}/{challenge.required_completions} {t('tasks')}
                                </p>
                            )}
                        </>
                    )}

                    {isClaimed ? (
                        <div className="flex items-center gap-2 text-green-600 font-semibold mt-3 text-sm md:text-base">
                            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5"/>
                            {t('bonusClaimed')}
                        </div>
                    ) : (
                        <Button onClick={onClaim} disabled={!isUnlocked} className="w-full mt-2 text-sm md:text-base py-2 md:py-3">
                            <Star className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                            {isUnlocked ? `${t('claimBonus')} (+${challenge.token_bonus} ${t('tokens')})` : t('completeMoreTasks')}
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}