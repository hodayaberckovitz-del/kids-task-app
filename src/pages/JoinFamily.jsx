import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, Key, ArrowRight, Check, Copy, Share2, UserPlus, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/components/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function JoinFamily() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [familyCode, setFamilyCode] = useState('');
  const [myFamilyCode, setMyFamilyCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [childrenCount, setChildrenCount] = useState(0);
  const [targetFamily, setTargetFamily] = useState(null);
  const [transferOption, setTransferOption] = useState('transfer'); // 'transfer' or 'delete'

  useEffect(() => {
    loadUserData();
  }, []);

  const generateFamilyCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const loadUserData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Load user's family code
      if (currentUser.family_id) {
        const families = await base44.entities.Family.filter({
          id: currentUser.family_id
        });
        if (families.length > 0) {
          setMyFamilyCode(families[0].family_code);
        }
      } else {
        // Check if user has a family by email
        const families = await base44.entities.Family.filter({
          primary_parent_email: currentUser.email
        });
        if (families.length > 0) {
          setMyFamilyCode(families[0].family_code);
          await base44.auth.updateMe({ family_id: families[0].id });
        } else {
          // Create new family if user doesn't have one
          const newFamilyCode = generateFamilyCode();
          const newFamily = await base44.entities.Family.create({
            family_name: `${currentUser.full_name}'s Family`,
            family_code: newFamilyCode,
            primary_parent_email: currentUser.email
          });
          setMyFamilyCode(newFamilyCode);
          await base44.auth.updateMe({ family_id: newFamily.id });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleJoinFamily = async () => {
    if (!familyCode.trim()) {
      setError(t('fillAllFields') || 'Please enter a family code');
      return;
    }

    setIsJoining(true);
    setError('');
    setSuccess('');

    try {
      // Find family by code
      const families = await base44.entities.Family.filter({
        family_code: familyCode.trim().toUpperCase()
      });

      if (families.length === 0) {
        setError(t('invalidFamilyCode'));
        setIsJoining(false);
        return;
      }

      const family = families[0];
      
      // Check if user has existing children
      if (user.family_id) {
        const children = await base44.entities.ChildProfile.filter({
          family_id: user.family_id
        });
        
        if (children.length > 0) {
          // Show warning dialog
          setChildrenCount(children.length);
          setTargetFamily(family);
          setShowWarning(true);
          setIsJoining(false);
          return;
        }
      }

      // No children - join directly
      await base44.auth.updateMe({ family_id: family.id });
      localStorage.removeItem('selectedChildId'); // Clear previous child selection
      setSuccess(t('successfullyJoined', { familyName: family.family_name }));

      setTimeout(() => {
        window.location.href = createPageUrl('Dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error joining family:', error);
      setError(t('errorJoiningFamily'));
    } finally {
      setIsJoining(false);
    }
  };

  const handleConfirmJoin = async () => {
    setShowWarning(false);
    setIsJoining(true);

    try {
      if (transferOption === 'transfer') {
        // Transfer children and data to new family
        const children = await base44.entities.ChildProfile.filter({
          family_id: user.family_id
        });

        // Update all children to new family
        for (const child of children) {
          await base44.entities.ChildProfile.update(child.id, {
            family_id: targetFamily.id
          });
        }

        // Update all related entities
        const tasks = await base44.entities.Task.filter({ family_id: user.family_id });
        for (const task of tasks) {
          await base44.entities.Task.update(task.id, { family_id: targetFamily.id });
        }

        const rewards = await base44.entities.Reward.filter({ family_id: user.family_id });
        for (const reward of rewards) {
          await base44.entities.Reward.update(reward.id, { family_id: targetFamily.id });
        }

        const completions = await base44.entities.TaskCompletion.filter({ family_id: user.family_id });
        for (const completion of completions) {
          await base44.entities.TaskCompletion.update(completion.id, { family_id: targetFamily.id });
        }

        const events = await base44.entities.Event.filter({ family_id: user.family_id });
        for (const event of events) {
          await base44.entities.Event.update(event.id, { family_id: targetFamily.id });
        }

        const subjects = await base44.entities.Subject.filter({ family_id: user.family_id });
        for (const subject of subjects) {
          await base44.entities.Subject.update(subject.id, { family_id: targetFamily.id });
        }

        const schedules = await base44.entities.Schedule.filter({ family_id: user.family_id });
        for (const schedule of schedules) {
          await base44.entities.Schedule.update(schedule.id, { family_id: targetFamily.id });
        }

        const homework = await base44.entities.HomeworkTask.filter({ family_id: user.family_id });
        for (const hw of homework) {
          await base44.entities.HomeworkTask.update(hw.id, { family_id: targetFamily.id });
        }

        const wishlist = await base44.entities.WishlistItem.filter({ family_id: user.family_id });
        for (const wish of wishlist) {
          await base44.entities.WishlistItem.update(wish.id, { family_id: targetFamily.id });
        }

        const challenges = await base44.entities.Challenge.filter({ family_id: user.family_id });
        for (const challenge of challenges) {
          await base44.entities.Challenge.update(challenge.id, { family_id: targetFamily.id });
        }

      } else {
        // Delete old family data
        const oldFamilyId = user.family_id;
        
        // Delete all children and their data
        const children = await base44.entities.ChildProfile.filter({ family_id: oldFamilyId });
        for (const child of children) {
          await base44.entities.ChildProfile.delete(child.id);
        }

        // Delete all related entities
        const tasks = await base44.entities.Task.filter({ family_id: oldFamilyId });
        for (const task of tasks) {
          await base44.entities.Task.delete(task.id);
        }

        const rewards = await base44.entities.Reward.filter({ family_id: oldFamilyId });
        for (const reward of rewards) {
          await base44.entities.Reward.delete(reward.id);
        }

        const completions = await base44.entities.TaskCompletion.filter({ family_id: oldFamilyId });
        for (const completion of completions) {
          await base44.entities.TaskCompletion.delete(completion.id);
        }

        const events = await base44.entities.Event.filter({ family_id: oldFamilyId });
        for (const event of events) {
          await base44.entities.Event.delete(event.id);
        }

        const subjects = await base44.entities.Subject.filter({ family_id: oldFamilyId });
        for (const subject of subjects) {
          await base44.entities.Subject.delete(subject.id);
        }

        const schedules = await base44.entities.Schedule.filter({ family_id: oldFamilyId });
        for (const schedule of schedules) {
          await base44.entities.Schedule.delete(schedule.id);
        }

        const homework = await base44.entities.HomeworkTask.filter({ family_id: oldFamilyId });
        for (const hw of homework) {
          await base44.entities.HomeworkTask.delete(hw.id);
        }

        const wishlist = await base44.entities.WishlistItem.filter({ family_id: oldFamilyId });
        for (const wish of wishlist) {
          await base44.entities.WishlistItem.delete(wish.id);
        }

        const challenges = await base44.entities.Challenge.filter({ family_id: oldFamilyId });
        for (const challenge of challenges) {
          await base44.entities.Challenge.delete(challenge.id);
        }
      }

      // Update user to new family
      await base44.auth.updateMe({ family_id: targetFamily.id });
      localStorage.removeItem('selectedChildId'); // Clear previous child selection

      setSuccess(t('successfullyJoined', { familyName: targetFamily.family_name }));

      setTimeout(() => {
        window.location.href = createPageUrl('Dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error during family transfer:', error);
      setError('שגיאה בהצטרפות למשפחה. נסה שוב.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyCode = () => {
    if (myFamilyCode) {
      navigator.clipboard.writeText(myFamilyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (myFamilyCode) {
      const shareText = t('shareTextMessage', { familyCode: myFamilyCode });

      if (navigator.share) {
        try {
          await navigator.share({
            title: t('familyCode'),
            text: shareText
          });
        } catch (error) {
          console.log('Share cancelled');
        }
      } else {
        handleCopyCode();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users className="w-16 h-16 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">
              {t('familySharingTitle')}
            </h1>
          </div>
          <p className="text-xl text-white/90">
            {t('familySharingDescription')}
          </p>
        </motion.div>

        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <Button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            variant="outline"
            className="bg-white/90 hover:bg-white"
          >
            <Home className="w-5 h-5 mr-2" />
            {t('backToDashboard')}
          </Button>
        </div>

        <Tabs defaultValue="mycode" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="mycode">
              <Key className="w-5 h-5 mr-2" />
              {t('myFamilyCode')}
            </TabsTrigger>
            <TabsTrigger value="join">
              <UserPlus className="w-5 h-5 mr-2" />
              {t('joinFamily')}
            </TabsTrigger>
          </TabsList>

          {/* My Family Code Tab */}
          <TabsContent value="mycode">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Key className="w-6 h-6 text-purple-600" />
                    {t('yourFamilyCode')}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {t('sendCodeToParent')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {myFamilyCode ? (
                    <>
                      {/* Family Code Display */}
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          {t('familyCode')}
                        </p>
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-5xl font-black text-purple-600 tracking-wider"
                        >
                          {myFamilyCode}
                        </motion.div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleCopyCode}
                          className="flex-1 h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {copied ? (
                            <>
                              <Check className="w-5 h-5 mr-2" />
                              {t('copied')}
                            </>
                          ) : (
                            <>
                              <Copy className="w-5 h-5 mr-2" />
                              {t('copyCode')}
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleShare}
                          variant="outline"
                          className="flex-1 h-14 text-lg border-2"
                        >
                          <Share2 className="w-5 h-5 mr-2" />
                          {t('share')}
                        </Button>
                      </div>

                      {/* Instructions */}
                      <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {t('howToUse')}
                        </h4>
                        <ol className={`text-sm text-blue-800 space-y-2 ${isRTL ? 'pr-4' : 'pl-4'}`}>
                          <li className="list-decimal">
                            {t('step1SendCode')}
                          </li>
                          <li className="list-decimal">
                            {t('step2SignUp')}
                          </li>
                          <li className="list-decimal">
                            {t('step3EnterCode')}
                          </li>
                          <li className="list-decimal">
                            {t('step4ShareData')}
                          </li>
                        </ol>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        {t('loadingFamilyCode')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Join Family Tab */}
          <TabsContent value="join">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-green-600" />
                    {t('joinExistingFamily')}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {t('receivedCodeEnterHere')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Input for Family Code */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t('familyCode')}
                    </label>
                    <Input
                      value={familyCode}
                      onChange={(e) => {
                        setFamilyCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      placeholder={t('enterFamilyCodeHere')}
                      className="h-14 text-center text-2xl font-bold tracking-wider"
                      maxLength={6}
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border-2 border-green-200 text-green-700 p-4 rounded-xl text-center"
                    >
                      <Check className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      {success}
                    </motion.div>
                  )}

                  {/* Join Button */}
                  <Button
                    onClick={handleJoinFamily}
                    disabled={isJoining || !familyCode.trim()}
                    className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {isJoining ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          ⏳
                        </motion.div>
                        {t('joining')}
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5 mr-2" />
                        {t('joinFamily')}
                      </>
                    )}
                  </Button>

                  {/* Info Box */}
                  <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-2">
                      {t('goodToKnow')}
                    </h4>
                    <ul className={`text-sm text-purple-800 space-y-1 ${isRTL ? 'pr-4' : 'pl-4'}`}>
                      <li className="list-disc">
                        {t('allParentsSeeData')}
                      </li>
                      <li className="list-disc">
                        {t('everyoneCanEdit')}
                      </li>
                      <li className="list-disc">
                        {t('changesRealTime')}
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Warning Dialog */}
        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
          <AlertDialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                {isRTL ? 'אזהרה: יש לך נתונים קיימים' : 'Warning: You have existing data'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base space-y-4">
                <p>
                  {isRTL 
                    ? `נמצאו ${childrenCount} ילדים במשפחה הנוכחית שלך עם משימות, תגמולים ונתונים נוספים.`
                    : `Found ${childrenCount} children in your current family with tasks, rewards and other data.`
                  }
                </p>
                
                <div className="space-y-3 pt-2">
                  <p className="font-semibold">
                    {isRTL ? 'בחר אפשרות:' : 'Choose an option:'}
                  </p>
                  
                  <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="transfer"
                      value="transfer"
                      checked={transferOption === 'transfer'}
                      onChange={(e) => setTransferOption(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-green-700">
                        {isRTL ? '✅ העבר את הנתונים למשפחה החדשה' : '✅ Transfer data to new family'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {isRTL 
                          ? 'כל הילדים, המשימות והנתונים יועברו למשפחה החדשה'
                          : 'All children, tasks and data will be moved to the new family'
                        }
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="transfer"
                      value="delete"
                      checked={transferOption === 'delete'}
                      onChange={(e) => setTransferOption(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-red-700">
                        {isRTL ? '🗑️ מחק את הנתונים הישנים' : '🗑️ Delete old data'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {isRTL 
                          ? 'כל הילדים והנתונים מהמשפחה הישנה יימחקו לצמיתות'
                          : 'All children and data from old family will be permanently deleted'
                        }
                      </div>
                    </div>
                  </label>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {isRTL ? 'ביטול' : 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmJoin}
                className={transferOption === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {isRTL ? 'המשך' : 'Continue'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}