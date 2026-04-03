import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useSubscription() {
  const [plan, setPlan] = useState('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const user = await base44.auth.me();
      const subs = await base44.entities.Subscription.filter({ user_email: user.email, is_active: true });
      if (subs.length > 0) {
        // Pick the best active plan
        const hasFamilyPlan = subs.some(s => s.plan === 'family');
        const hasPremium = subs.some(s => s.plan === 'premium');
        if (hasFamilyPlan) setPlan('family');
        else if (hasPremium) setPlan('premium');
        else setPlan('free');
      } else {
        setPlan('free');
      }
    } catch {
      setPlan('free');
    } finally {
      setIsLoading(false);
    }
  };

  const canAddChild = (currentCount) => {
    if (plan === 'free') return currentCount < 1;
    return true;
  };

  const canAddTask = (currentCount) => {
    if (plan === 'free') return currentCount < 5;
    return true;
  };

  const canPlayGame = (gamesPlayedToday) => {
    if (plan === 'free') return gamesPlayedToday < 1;
    return true;
  };

  const isPremium = plan === 'premium' || plan === 'family';
  const isFamily = plan === 'family';

  return { plan, isLoading, isPremium, isFamily, canAddChild, canAddTask, canPlayGame };
}