import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { PiggyBank, Plus, Target, Coins, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/components/LanguageContext';
import confetti from 'canvas-confetti';

export default function SavingsBank({ profile, onTokensUpdated }) {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [depositAmounts, setDepositAmounts] = useState({});
  const [newGoal, setNewGoal] = useState({ title: '', target_amount: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { language, isRTL } = useLanguage();

  const texts = {
    he: {
      title: 'בנק החיסכון 🐷',
      sub: 'חסוך אסימונים ליעדים גדולים!',
      addGoal: 'הוסף יעד חיסכון',
      goalName: 'שם היעד',
      targetAmount: 'כמות אסימונים ליעד',
      deposit: 'הפקד',
      depositTo: 'הפקד ל:',
      noGoals: 'אין יעדי חיסכון עדיין',
      addFirst: 'הוסף את יעד החיסכון הראשון שלך!',
      saved: 'נחסך',
      of: 'מתוך',
      balance: 'יתרה',
      interest: '💡 ריבית 10% כל שבוע על הסכום שחסכת!',
      complete: 'הגעת ליעד! 🎉',
      save: 'שמור',
      cancel: 'ביטול',
      notEnough: 'אין מספיק אסימונים',
    },
    en: {
      title: 'Savings Bank 🐷',
      sub: 'Save tokens for big goals!',
      addGoal: 'Add Savings Goal',
      goalName: 'Goal Name',
      targetAmount: 'Token target amount',
      deposit: 'Deposit',
      depositTo: 'Deposit to:',
      noGoals: 'No savings goals yet',
      addFirst: 'Add your first savings goal!',
      saved: 'Saved',
      of: 'of',
      balance: 'Balance',
      interest: '💡 10% interest every week on your savings!',
      complete: 'Goal reached! 🎉',
      save: 'Save',
      cancel: 'Cancel',
      notEnough: 'Not enough tokens',
    },
    ru: {
      title: 'Банк накоплений 🐷',
      sub: 'Копи жетоны на большие цели!',
      addGoal: 'Добавить цель',
      goalName: 'Название цели',
      targetAmount: 'Целевое количество жетонов',
      deposit: 'Пополнить',
      depositTo: 'Пополнить:',
      noGoals: 'Нет целей накопления',
      addFirst: 'Добавьте свою первую цель!',
      saved: 'Накоплено',
      of: 'из',
      balance: 'Баланс',
      interest: '💡 10% в неделю на накопления!',
      complete: 'Цель достигнута! 🎉',
      save: 'Сохранить',
      cancel: 'Отмена',
      notEnough: 'Недостаточно жетонов',
    },
    ar: {
      title: 'بنك المدخرات 🐷',
      sub: 'وفر رموزاً لأهداف كبيرة!',
      addGoal: 'إضافة هدف توفير',
      goalName: 'اسم الهدف',
      targetAmount: 'كمية الرموز المستهدفة',
      deposit: 'إيداع',
      depositTo: 'إيداع في:',
      noGoals: 'لا توجد أهداف توفير بعد',
      addFirst: 'أضف هدف التوفير الأول!',
      saved: 'محفوظ',
      of: 'من',
      balance: 'الرصيد',
      interest: '💡 فائدة 10% كل أسبوع!',
      complete: 'تم الوصول للهدف! 🎉',
      save: 'حفظ',
      cancel: 'إلغاء',
      notEnough: 'رموز غير كافية',
    },
  };
  const tx = texts[language] || texts.he;

  useEffect(() => {
    if (profile) loadGoals();
  }, [profile]);

  const loadGoals = async () => {
    try {
      const data = await base44.entities.SavingsGoal.filter({ child_profile_id: profile.id, family_id: profile.family_id });
      setGoals(data);
    } catch (e) {
      console.error('Error loading savings goals', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.target_amount) return;
    setIsSaving(true);
    try {
      await base44.entities.SavingsGoal.create({
        title: newGoal.title,
        target_amount: Number(newGoal.target_amount),
        current_amount: 0,
        is_completed: false,
        child_profile_id: profile.id,
        family_id: profile.family_id,
      });
      setNewGoal({ title: '', target_amount: '' });
      setShowAddForm(false);
      await loadGoals();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeposit = async (goal) => {
    const amount = Number(depositAmounts[goal.id] || 0);
    if (!amount || amount <= 0) return;
    if (amount > (profile.total_tokens || 0)) {
      alert(tx.notEnough);
      return;
    }

    try {
      const newSaved = (goal.current_amount || 0) + amount;
      const isCompleted = newSaved >= goal.target_amount;

      await base44.entities.SavingsGoal.update(goal.id, {
        current_amount: newSaved,
        is_completed: isCompleted,
      });

      await base44.entities.ChildProfile.update(profile.id, {
        total_tokens: (profile.total_tokens || 0) - amount,
      });

      if (isCompleted) {
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
        // Notify parent
        try {
          const user = await base44.auth.me();
          await base44.integrations.Core.SendEmail({
            to: profile.parent_email || user.email,
            subject: `🎉 ${profile.name} הגיע ליעד החיסכון "${goal.title}"!`,
            body: `כל הכבוד! ${profile.name} הגיע ליעד החיסכון "${goal.title}" עם ${newSaved} אסימונים! 🎊`,
          });
        } catch {}
      }

      setDepositAmounts(prev => ({ ...prev, [goal.id]: '' }));
      await loadGoals();
      if (onTokensUpdated) onTokensUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="text-center py-8 text-gray-500">...</div>;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-black text-gray-800 mb-1">{tx.title}</h2>
        <p className="text-gray-500">{tx.sub}</p>
        <p className="text-sm text-purple-600 mt-2 font-medium">{tx.interest}</p>
      </div>

      {/* Balance */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
        <CardContent className="p-4 text-center">
          <p className="text-white/80 text-sm mb-1">{tx.balance}</p>
          <p className="text-4xl font-black">🪙 {profile.total_tokens || 0}</p>
        </CardContent>
      </Card>

      {/* Goals */}
      {goals.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <PiggyBank className="w-16 h-16 mx-auto mb-3 opacity-30" />
          <p className="font-bold">{tx.noGoals}</p>
          <p className="text-sm">{tx.addFirst}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const progress = Math.min(100, ((goal.current_amount || 0) / goal.target_amount) * 100);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`border-2 ${goal.is_completed ? 'border-yellow-400 bg-yellow-50' : 'border-purple-200'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {goal.is_completed ? <Trophy className="w-5 h-5 text-yellow-500" /> : <Target className="w-5 h-5 text-purple-600" />}
                        <span className="font-bold text-lg">{goal.title}</span>
                      </div>
                      {goal.is_completed && (
                        <span className="text-yellow-600 font-bold text-sm">{tx.complete}</span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <span>{tx.saved}: {goal.current_amount || 0}</span>
                      <span>{tx.of} {goal.target_amount} 🪙</span>
                    </div>

                    {!goal.is_completed && (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          max={profile.total_tokens || 0}
                          placeholder="כמה להפקיד?"
                          value={depositAmounts[goal.id] || ''}
                          onChange={e => setDepositAmounts(prev => ({ ...prev, [goal.id]: e.target.value }))}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleDeposit(goal)}
                          disabled={!depositAmounts[goal.id]}
                          className="bg-gradient-to-r from-purple-500 to-pink-500"
                        >
                          <Coins className="w-4 h-4 mr-1" />
                          {tx.deposit}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Goal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-2 border-dashed border-purple-300">
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder={tx.goalName}
                  value={newGoal.title}
                  onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder={tx.targetAmount}
                  value={newGoal.target_amount}
                  onChange={e => setNewGoal(p => ({ ...p, target_amount: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddGoal} disabled={isSaving} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500">
                    {isSaving ? '...' : tx.save}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                    {tx.cancel}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!showAddForm && (
        <Button
          onClick={() => setShowAddForm(true)}
          variant="outline"
          className="w-full border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 py-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          {tx.addGoal}
        </Button>
      )}
    </div>
  );
}