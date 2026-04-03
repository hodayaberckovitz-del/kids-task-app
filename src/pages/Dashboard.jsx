import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Star as StarIcon, Sun, Moon, Gift, Users, ChevronDown, Clock, WifiOff, ChevronsRight, Briefcase, Sparkles, Trophy, Target, Zap, Flame, Rocket } from "lucide-react";
import Icon from "../components/shared/Icon";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/components/LanguageContext";
import AdultTodoList from "../components/AdultTodoList";
import PullToRefresh from "../components/PullToRefresh";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import TokenCounter from "../components/TokenCounter";
import DashboardSkeleton from "../components/DashboardSkeleton";
import TaskCard from "../components/TaskCard";
import HomeworkCard from "../components/HomeworkCard";
import StarTaskCard from "../components/StarTaskCard";
import StreakDisplay from "../components/StreakDisplay";
import RewardCard from "../components/RewardCard";
import TaskInputModal from "../components/TaskInputModal";
import OnboardingModal from "../components/OnboardingModal";
import TimerTaskCard from "../components/TimerTaskCard";
import BackpackChecklistModal from "../components/BackpackChecklistModal";
import BackpackPreparationModal from "../components/BackpackPreparationModal";
import HomeworkTimer from "../components/HomeworkTimer";
import ParentMessageCard from "../components/ParentMessageCard";
import ChallengeCard from "../components/ChallengeCard";

const CHARACTER_EMOJIS = {
  none: '⭐',
  superhero: '🦸‍♂️',
  astronaut: '👨‍🚀',
  ninja: '🥷',
  knight: '🤺',
  pirate: '🏴‍☠️',
  dinosaur: '🦖',
  princess: '👸',
  fairy: '🧚‍♀️',
  mermaid: '🧜‍♀️',
  ballerina: '💃',
  unicorn: '🦄',
  butterfly: '🦋'
};

// מיפוי צבעי רקע לפי הצבע האהוב של הילד
const BACKGROUND_GRADIENTS = {
  blue: 'from-blue-400 via-cyan-300 to-blue-300',
  pink: 'from-pink-400 via-rose-300 to-pink-300',
  purple: 'from-purple-400 via-pink-300 to-purple-300',
  green: 'from-green-400 via-emerald-300 to-green-300',
  red: 'from-red-400 via-orange-300 to-red-300',
  rainbow: 'from-pink-400 via-purple-300 to-cyan-300',
  space: 'from-indigo-600 via-purple-500 to-indigo-400',
  ocean: 'from-blue-600 via-teal-400 to-blue-300',
  minimal: 'from-gray-50 via-gray-100 to-gray-50',
  dark: 'from-slate-700 via-slate-800 to-slate-900',
  nature: 'from-green-200 via-blue-200 to-green-100'
};

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [homeworkTasks, setHomeworkTasks] = useState([]);
  const [tomorrowHomework, setTomorrowHomework] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [bonusActivities, setBonusActivities] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [profile, setProfile] = useState(null);
  const [allChildren, setAllChildren] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showGiftUnlock, setShowGiftUnlock] = useState(null);
  const [taskForInput, setTaskForInput] = useState(null);
  const [showBackpackModal, setShowBackpackModal] = useState(false);
  const [taskForBackpack, setTaskForBackpack] = useState(null);
  const [showBackpackPrep, setShowBackpackPrep] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isParent, setIsParent] = useState(false);
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setConnectionError(false);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      let userFamilyId = currentUser.family_id;
      
      if (!userFamilyId) {
        console.warn('User missing family_id, checking for existing family...');
        
        const families = await base44.entities.Family.filter({ 
          primary_parent_email: currentUser.email 
        });
        
        if (families.length > 0) {
          userFamilyId = families[0].id;
          await base44.auth.updateMe({ family_id: userFamilyId });
          currentUser.family_id = userFamilyId;
          setUser(currentUser);
          console.log('Updated user with existing family_id:', userFamilyId);
        } else {
          console.warn('No family found, creating one automatically...');
          try {
            const familyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const userName = currentUser.full_name || currentUser.email.split('@')[0];
            const newFamily = await base44.entities.Family.create({
              family_name: `${userName}'s Family`,
              family_code: familyCode,
              primary_parent_email: currentUser.email
            });
            userFamilyId = newFamily.id;
            await base44.auth.updateMe({ family_id: userFamilyId });
            currentUser.family_id = userFamilyId;
            setUser(currentUser);
            console.log('Created new family with id:', userFamilyId);
          } catch (familyError) {
            console.error('Error creating family:', familyError);
          }
        }
      }

      const familyData = await base44.entities.Family.filter({ id: userFamilyId });
      const isParentUser = familyData.length > 0 && familyData[0].primary_parent_email === currentUser.email;
      setIsParent(isParentUser);

      const childrenData = await base44.entities.ChildProfile.filter({ family_id: userFamilyId });
      console.log('Loaded children by family_id:', { userFamilyId, childCount: childrenData.length, childrenIds: childrenData.map(c => c.id) });
      
      if (childrenData.length === 0) {
        setShowOnboarding(true);
        setIsLoading(false);
        return;
      }
      setAllChildren(childrenData);

      const selectedChildId = localStorage.getItem('selectedChildId');
      let currentProfile;
      
      if (selectedChildId) {
        currentProfile = childrenData.find(c => c.id === selectedChildId);
      }
      
      if (!currentProfile) {
        currentProfile = childrenData[0];
        localStorage.setItem('selectedChildId', currentProfile.id);
      }
      
      if (!currentProfile.family_id && userFamilyId) {
        console.warn('Profile missing family_id, updating with:', userFamilyId);
        await base44.entities.ChildProfile.update(currentProfile.id, {
          family_id: userFamilyId
        });
        currentProfile.family_id = userFamilyId;
      }
      
      setProfile(currentProfile);
      
      console.log('Final state:', {
        userFamilyId: userFamilyId,
        profileFamilyId: currentProfile.family_id,
        profileId: currentProfile.id,
        profileLanguage: currentProfile.language
      });

      const today = format(new Date(), 'yyyy-MM-dd');
      const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
      const tomorrowDayOfWeek = new Date(Date.now() + 86400000).getDay();
      
      const profileLanguage = currentProfile.language || 'he';

      try {
        const [allTasksData, homeworkData, tomorrowHomeworkData, subjectsData, schedulesData, allRewardsData, todayCompletionsData, challengesData, completedChallengesData] = await Promise.all([
          base44.entities.Task.filter({ is_active: true, family_id: userFamilyId }, 'order'),
          base44.entities.HomeworkTask.filter({ due_date: today, family_id: userFamilyId, child_profile_id: currentProfile.id }, '-created_date'),
          base44.entities.HomeworkTask.filter({ due_date: tomorrow, family_id: userFamilyId, child_profile_id: currentProfile.id }, '-created_date'),
          base44.entities.Subject.filter({ family_id: userFamilyId, child_profile_id: currentProfile.id }),
          base44.entities.Schedule.filter({ family_id: userFamilyId, child_profile_id: currentProfile.id }),
          base44.entities.Reward.filter({ family_id: userFamilyId, child_profile_id: currentProfile.id }),
          base44.entities.TaskCompletion.filter({ completed_date: today, family_id: userFamilyId, child_profile_id: currentProfile.id }),
          base44.entities.Challenge.filter({ family_id: userFamilyId, child_profile_id: currentProfile.id, is_active: true }),
          base44.entities.ChallengeCompletion.filter({ family_id: userFamilyId, child_profile_id: currentProfile.id })
        ]);

        const tasksData = allTasksData.filter(task => (!task.child_profile_id || task.child_profile_id === currentProfile.id) && (!task.language || task.language === profileLanguage));
        const rewardsData = allRewardsData.filter(reward => !reward.language || reward.language === profileLanguage);

        setTasks(tasksData);
        setHomeworkTasks(homeworkData);
        setTomorrowHomework(tomorrowHomeworkData);
        setSubjects(subjectsData);
        setSchedules(schedulesData);
        setRewards(rewardsData);
        setCompletedToday(todayCompletionsData);
        setChallenges(challengesData.filter(c => new Date(c.expires_at) > new Date()));
        setCompletedChallenges(completedChallengesData);

        // Check and load bonus activities
        await checkBonusActivities(currentProfile.id, currentProfile, t);

      } catch (dataError) {
        console.error(t('errorLoadingData'), dataError);
        setConnectionError(true);
      }

    } catch (error) {
      console.error(t('errorLoadingUser'), error);
      if (error.message && error.message.includes("401")) {
        navigate(createPageUrl("Registration"));
      } else {
        setConnectionError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, t]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData, retryCount]);

  const handleTaskComplete = useCallback(async (task, isCurrentlyCompleted = false, inputValue = null) => {
    if (!profile) {
      console.error('No profile available');
      return;
    }
    
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (isCurrentlyCompleted) {
      if (!isParent) return;
      try {
        setCompletedToday(prev => prev.filter(c => c.task_id !== task.id));
        const completions = await base44.entities.TaskCompletion.filter({
          task_id: task.id,
          child_profile_id: profile.id,
          completed_date: today
        });
        if (completions.length > 0) {
          const completion = completions[0];
          const tokensToReturn = completion.tokens_earned || 0;
          await base44.entities.TaskCompletion.delete(completion.id);
          const newTotalTokens = (profile.total_tokens || 0) - tokensToReturn;
          const updatedProfile = await base44.entities.ChildProfile.update(profile.id, { total_tokens: newTotalTokens });
          setProfile(updatedProfile);
        }
      } catch (error) {
        console.error('Error undoing task:', error);
        loadInitialData();
      }
      return;
    }
    
    try {
      const todayDate = new Date();
      let tokensEarned = Number(task.base_tokens) || Number(task.star_tokens) || Number(task.timed_tokens) || 1;
      const familyId = profile.family_id || user?.family_id || task.family_id;
      
      if (!familyId) {
        console.error('Missing family_id:', {
          profileFamilyId: profile.family_id,
          userFamilyId: user?.family_id,
          taskFamilyId: task.family_id
        });
        alert(t('errorSavingTask') + ': ' + t('fillAllFields'));
        return;
      }

      // Streak is ONLY updated when completing the FIRST task of the day
      // Check if this is the first task completed today
      const todayCompletionsBefore = await base44.entities.TaskCompletion.filter({
        child_profile_id: profile.id,
        completed_date: today
      });

      let newStreak = profile.current_streak || 0;
      let newBestStreak = profile.best_streak || 0;

      // ONLY update streak if this is the first task today
      if (todayCompletionsBefore.length === 0) {
        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        const lastCompletionDate = profile.last_completion_date;
        
        // Check if last completion was yesterday
        if (lastCompletionDate === yesterday) {
          // Continue streak
          newStreak = (profile.current_streak || 0) + 1;
        } else if (lastCompletionDate === today) {
          // Already completed today - keep current streak
          newStreak = profile.current_streak || 1;
        } else {
          // Gap in completions - reset to 1
          newStreak = 1;
        }

        // Update best streak if current is now higher
        if (newStreak > (profile.best_streak || 0)) {
          newBestStreak = newStreak;
        } else {
          newBestStreak = profile.best_streak || 0;
        }
      }
      // If NOT first task today, keep existing streak values

      // Add bonus tokens for 7-day streak (if enabled)
      if (newStreak >= 7 && profile.streak_bonus_enabled !== false) {
        const bonusTokens = profile.streak_bonus_tokens || 1;
        tokensEarned += bonusTokens;
      }
      
      const completionData = {
        task_id: task.id,
        child_profile_id: profile.id,
        completed_date: today,
        completed_at: todayDate.toISOString(),
        tokens_earned: tokensEarned,
        family_id: familyId
      };
      
      // Only add input_value if it's a non-empty string
      if (inputValue && typeof inputValue === 'string' && inputValue.trim()) {
        completionData.input_value = inputValue;
      }
      
      console.log('Creating task completion:', completionData);
      
      // Optimistic update - add to UI immediately
      const optimisticCompletion = { ...completionData, id: `temp-${Date.now()}` };
      setCompletedToday(prev => [...prev, optimisticCompletion]);
      
      const currentTokens = Number(profile.total_tokens) || 0;
      const newTotal = currentTokens + tokensEarned;
      setProfile(prev => ({ ...prev, total_tokens: newTotal }));
      
      const completion = await base44.entities.TaskCompletion.create(completionData);
      setCompletedToday(prev => prev.map(c => c.id === optimisticCompletion.id ? completion : c));

      base44.analytics.track({
        eventName: "task_completed",
        properties: {
          task_type: task.task_type || "morning",
          tokens_earned: tokensEarned,
          streak: newStreak,
          input_type: task.input_type || "checkbox"
        }
      });

      // ONLY update streak fields if this was the first task today
      const profileUpdate = { 
        total_tokens: newTotal
      };
      
      if (todayCompletionsBefore.length === 0) {
        // First task today - update streak and last_completion_date
        profileUpdate.current_streak = newStreak;
        profileUpdate.best_streak = newBestStreak;
        profileUpdate.last_completion_date = today;
      }
      
      const updatedProfile = await base44.entities.ChildProfile.update(profile.id, profileUpdate);
      setProfile(updatedProfile);

      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);

      if (task.type === 'one-time') {
        if (isParent) {
          await base44.entities.Task.update(task.id, { is_active: false });
        }
        setTasks(prev => prev.filter(t => t.id !== task.id));
      }

    } catch (error) {
      console.error('Error completing task:', error);
      alert(t('errorCompletingTask') + ': ' + (error.message || 'Unknown error'));
    }
  }, [profile, user, t]);

  const handleHomeworkComplete = useCallback(async (homework) => {
    if (!profile) return;
    
    try {
      await base44.entities.HomeworkTask.update(homework.id, { is_completed: true });

      base44.analytics.track({ eventName: "homework_completed", properties: { tokens_earned: 8 } });
      
      const homeworkTokens = 8;
      const currentTokens = Number(profile.total_tokens) || 0;
      const newTokens = currentTokens + homeworkTokens;
      
      const updatedProfile = await base44.entities.ChildProfile.update(profile.id, { total_tokens: newTokens });
      setProfile(updatedProfile);
      setHomeworkTasks(prev => prev.filter(hw => hw.id !== homework.id));

      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } catch (error) {
      console.error(t('errorCompletingHomework'), error);
      alert(t('errorCompletingHomework') + ': ' + (error.message || 'Unknown error'));
    }
  }, [profile, t]);

  const handleClaimChallenge = async (challenge) => {
    if (!profile) return;

    try {
      const familyId = profile.family_id || user?.family_id || challenge.family_id;
      
      if (!familyId) {
        console.error('Missing family_id for challenge');
        alert(t('errorSavingTask') + ': ' + t('fillAllFields'));
        return;
      }
      
      const completionData = {
        challenge_id: challenge.id,
        child_profile_id: profile.id,
        completed_at: new Date().toISOString(),
        family_id: familyId
      };
      
      await base44.entities.ChallengeCompletion.create(completionData);

      base44.analytics.track({ eventName: "challenge_claimed", properties: { tokens_earned: Number(challenge.token_bonus) || 0, challenge_type: challenge.type || "daily" } });

      const challengeTokens = Number(challenge.token_bonus) || 0;
      const currentTokens = Number(profile.total_tokens) || 0;
      const newTokens = currentTokens + challengeTokens;
      
      const updatedProfile = await base44.entities.ChildProfile.update(profile.id, { total_tokens: newTokens });
      setProfile(updatedProfile);

      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      
      loadInitialData();
    } catch (error) {
      console.error("Error claiming challenge:", error);
      alert(t('errorClaimingReward') + ': ' + (error.message || 'Unknown error'));
    }
  };

  const handleDismissMessage = async () => {
    if (!profile) return;
    try {
      const updatedProfile = await base44.entities.ChildProfile.update(profile.id, {
        parent_message: null,
        parent_message_icon: null
      });
      setProfile(updatedProfile);
    } catch(error) {
      console.error("Error dismissing message:", error);
    }
  };

  const handleClaimReward = async (reward) => {
    if (!profile) return;

    try {
      const rewardCost = Number(reward.token_cost) || 0;
      const currentTokens = Number(profile.total_tokens) || 0;
      
      if (currentTokens < rewardCost) {
        alert(t('notEnoughTokens'));
        return;
      }

      const updatedReward = await base44.entities.Reward.update(reward.id, { is_claimed: true });
      const updatedProfile = await base44.entities.ChildProfile.update(profile.id, {
        total_tokens: currentTokens - rewardCost
      });

      setRewards(prevRewards => prevRewards.map(r => r.id === updatedReward.id ? updatedReward : r));
      setProfile(updatedProfile);

      base44.analytics.track({ eventName: "reward_claimed", properties: { tokens_spent: rewardCost } });

      const parentUser = await base44.auth.me();
      if (parentUser && parentUser.email) {
        const rewardName = reward.name || reward.title || t('rewards');
        const emailSubject = t('rewardClaimedEmailSubject', { childName: profile.name, rewardName });
        const emailBody = t('rewardClaimedEmailBody', { 
          childName: profile.name,
          rewardName,
          tokensSpent: rewardCost,
          remainingTokens: updatedProfile.total_tokens
        });

        await base44.integrations.Core.SendEmail({
          to: parentUser.email,
          subject: emailSubject,
          body: emailBody,
        });
      }

    } catch (error) {
      console.error(t('errorClaimingReward'), error);
    }
  };

  const handleChildSwitch = async (childId) => {
    localStorage.setItem('selectedChildId', childId);
    loadInitialData();
  };

  const checkBonusActivities = async (childId, childProfile, translateFn) => {
    try {
      const activities = await base44.entities.BonusActivity.filter({
        child_profile_id: childId,
        family_id: childProfile.family_id,
        is_active: true,
        is_claimed: false
      });

      const streak = childProfile.current_streak || 0;
      const todayCompletions = completedToday.length;

      // Create bonus for 3-day streak
      if (streak === 3 && !activities.some(a => a.unlock_condition === 'streak_3')) {
        await base44.entities.BonusActivity.create({
          title: translateFn('bonus3DaysTitle'),
          description: translateFn('bonus3DaysDesc'),
          icon: '🔥',
          bonus_tokens: 5,
          unlock_condition: 'streak_3',
          child_profile_id: childId,
          family_id: childProfile.family_id,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        });
      }

      // Create bonus for 7-day streak (week)
      if (streak === 7 && !activities.some(a => a.unlock_condition === 'streak_7')) {
        await base44.entities.BonusActivity.create({
          title: translateFn('bonus7DaysTitle'),
          description: translateFn('bonus7DaysDesc'),
          icon: '⭐',
          bonus_tokens: 10,
          unlock_condition: 'streak_7',
          child_profile_id: childId,
          family_id: childProfile.family_id,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        });
      }

      // Create bonus for 30-day streak (month)
      if (streak === 30 && !activities.some(a => a.unlock_condition === 'streak_30')) {
        await base44.entities.BonusActivity.create({
          title: translateFn('bonus30DaysTitle'),
          description: translateFn('bonus30DaysDesc'),
          icon: '🏆',
          bonus_tokens: 25,
          unlock_condition: 'streak_30',
          child_profile_id: childId,
          family_id: childProfile.family_id,
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        });
      }

      // Random bonus for completing 10 tasks
      if (todayCompletions >= 10 && !activities.some(a => a.unlock_condition === 'tasks_10')) {
        await base44.entities.BonusActivity.create({
          title: translateFn('bonus10TasksTitle'),
          description: translateFn('bonus10TasksDesc'),
          icon: '💫',
          bonus_tokens: 15,
          unlock_condition: 'tasks_10',
          child_profile_id: childId,
          family_id: childProfile.family_id,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }

      const updatedActivities = await base44.entities.BonusActivity.filter({
        child_profile_id: childId,
        family_id: profile.family_id,
        is_active: true,
        is_claimed: false
      });

      setBonusActivities(updatedActivities);
    } catch (error) {
      console.error('Error checking bonus activities:', error);
    }
  };

  const characterEmoji = (profile?.favorite_character && profile.favorite_character !== 'none') 
    ? CHARACTER_EMOJIS[profile.favorite_character] || '⭐' 
    : '⭐';
  const displayMode = profile?.task_display_mode || 'text_only';
  const backgroundGradient = profile?.color_theme ? BACKGROUND_GRADIENTS[profile.color_theme] || 'from-purple-400 via-pink-400 to-yellow-300' : 'from-purple-400 via-pink-400 to-yellow-300';

  const morningTasks = tasks.filter(task => task.task_type === 'morning' && !completedToday.some(c => c.task_id === task.id));
  const homeworkTasksToday = homeworkTasks.filter(hw => !hw.is_completed);
  const tomorrowHomeworkTasks = tomorrowHomework.filter(hw => !hw.is_completed);
  const tomorrowDayOfWeek = new Date(Date.now() + 86400000).getDay();
  const tomorrowSchedule = schedules.filter(s => s.day_of_week === tomorrowDayOfWeek);
  const backpackTasks = tasks.filter(task => task.input_type === 'backpack_checklist' && !completedToday.some(c => c.task_id === task.id));
  const eveningTasks = tasks.filter(task => task.task_type === 'evening' && !completedToday.some(c => c.task_id === task.id));
  const starTasks = tasks.filter(task => task.task_type === 'star' && !completedToday.some(c => c.task_id === task.id));
  const timedTasks = tasks.filter(task => task.task_type === 'timed' && !completedToday.some(c => c.task_id === task.id));

  const totalCompletedTasks = completedToday.length;

  if (isLoading) {
    return <DashboardSkeleton backgroundGradient={backgroundGradient} />;
  }

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-pink-500 flex flex-col justify-center items-center text-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-lg p-10 rounded-[3rem] shadow-2xl max-w-md"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <WifiOff className="w-32 h-32 text-red-600 mb-6 mx-auto" />
          </motion.div>
          <h2 className="text-3xl font-black text-gray-800 mb-4">😔 {t('connectionError')}</h2>
          <p className="text-lg text-gray-600 mb-8">{t('checkInternetOrTryAgain')}</p>
          <Button 
            onClick={() => setRetryCount(prev => prev + 1)} 
            className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-black text-xl py-4 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🔄 {t('retry')}
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col justify-center items-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-lg p-10 rounded-[3rem] shadow-2xl max-w-md text-center"
        >
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            👶
          </motion.div>
          <h2 className="text-3xl font-black text-gray-800 mb-4">{t('noChildProfile')}</h2>
          <p className="text-lg text-gray-600 mb-8">{t('pleaseCreateProfile')}</p>
          <Button 
            onClick={() => setShowOnboarding(true)} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-black text-xl py-4 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            ✨ {t('createProfile')}
          </Button>
        </motion.div>
        <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} onProfileCreated={loadInitialData} />
      </div>
    );
  }

  // If current profile is adult, show TODO list
  if (profile?.is_adult) {
    return (
      <div className="max-w-6xl mx-auto p-4 pb-24" dir={isRTL ? 'rtl' : 'ltr'}>
        {allChildren.length > 1 && (
          <div className="mb-6">
            <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/90 backdrop-blur-sm hover:bg-white border-2 border-purple-300 shadow-lg hover:shadow-xl font-bold text-lg rounded-3xl py-4 w-full md:w-auto">
                  <Users className="w-6 h-6 mr-2" />
                  <span>{profile.name} {profile.is_adult ? '👤' : '👶'}</span>
                  <ChevronDown className="w-5 h-5 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-2 border-purple-200 rounded-2xl">
                {allChildren.map(child => (
                  <DropdownMenuItem key={child.id} onSelect={() => handleChildSwitch(child.id)} className="text-lg font-bold">
                    {child.name} {child.is_adult ? '👤' : '👶'}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <AdultTodoList profile={profile} children={allChildren.filter(c => !c.is_adult)} onTaskComplete={loadInitialData} />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={loadInitialData}>
      <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient} dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`} dir={isRTL ? 'rtl' : 'ltr'} style={{ overscrollBehavior: 'none' }}>
      <div className="hidden md:block fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-20 text-6xl"
        >
          {characterEmoji}
        </motion.div>
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, 100, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-40 right-20 text-6xl"
        >
          🌟
        </motion.div>
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, 50, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-40 text-6xl"
        >
          🎈
        </motion.div>
        <motion.div 
          animate={{ 
            x: [0, -70, 0],
            y: [0, -70, 0],
            rotate: [0, 360, 0]
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-40 right-40 text-6xl"
        >
          {characterEmoji}
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 pb-8">
        {/* Bonus Activities Alert */}
        {bonusActivities.length > 0 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <Link to={createPageUrl("Rewards")} className="block">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 cursor-pointer shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-5xl"
                    >
                      🎁
                    </motion.div>
                    <div>
                      <div className="text-2xl font-black text-white drop-shadow-lg">
                        {t('secretBonuses', { count: bonusActivities.length })}
                      </div>
                      <div className="text-lg text-white/90 font-bold">{t('clickToOpenBonuses')}</div>
                    </div>
                  </div>
                  <ChevronsRight className="w-8 h-8 text-white" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {taskForInput && (
          <TaskInputModal
            task={taskForInput}
            isOpen={!!taskForInput}
            onClose={() => setTaskForInput(null)}
            onComplete={handleTaskComplete}
          />
        )}

        <BackpackChecklistModal
          isOpen={showBackpackModal}
          onClose={() => setShowBackpackModal(false)}
          task={taskForBackpack}
          onTaskComplete={handleTaskComplete}
          profile={profile}
        />

        <BackpackPreparationModal
          isOpen={showBackpackPrep}
          onClose={() => setShowBackpackPrep(false)}
          childProfile={profile}
        />

        {showOnboarding && (
          <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} onProfileCreated={loadInitialData} profileName={profile?.name} />
        )}

        {showGiftUnlock && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 p-8 rounded-[3rem] shadow-2xl text-center max-w-sm w-full relative overflow-hidden"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  initial={{ x: '50%', y: '50%', scale: 0 }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: [0, 1, 0],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                >
                  {['🎉', characterEmoji, '🎊', '✨', '🌟'][i % 5]}
                </motion.div>
              ))}
              
              <button onClick={() => setShowGiftUnlock(null)} className="absolute top-4 right-4 text-white text-4xl font-black hover:scale-125 transition-transform">
                ×
              </button>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-9xl mb-4"
              >
                🎁
              </motion.div>
              <h3 className="text-4xl font-black text-white mb-4 drop-shadow-lg">
                {t('giftUnlocked')}! 🎉
              </h3>
              <p className="text-2xl text-white font-bold mb-6 drop-shadow-md">
                {t('claimedReward', { name: showGiftUnlock.name || showGiftUnlock.title })}
              </p>
              <Button
                onClick={() => setShowGiftUnlock(null)}
                className="bg-white text-pink-600 hover:bg-gray-100 font-black text-2xl py-4 px-8 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
              >
                🎊 {t('awesome')}!
              </Button>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {profile && profile.parent_message && (
            <ParentMessageCard
              message={profile.parent_message}
              icon={profile.parent_message_icon}
              onDismiss={handleDismissMessage}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -100 }}
              animate={{ 
                opacity: 1, 
                scale: [0.5, 1.2, 1],
                y: 0
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.5,
                y: -50
              }}
              transition={{ 
                duration: 0.6,
                ease: "easeOut"
              }}
              className="fixed top-8 left-0 right-0 z-50 flex justify-center px-4"
            >
              <motion.div 
                className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white px-10 py-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                animate={{
                  boxShadow: [
                    "0 25px 50px -12px rgba(16, 185, 129, 0.5)",
                    "0 25px 50px -12px rgba(16, 185, 129, 0.8)",
                    "0 25px 50px -12px rgba(16, 185, 129, 0.5)"
                  ]
                }}
                transition={{ duration: 0.8, repeat: 2 }}
              >
                {/* Sparkle background effect */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      initial={{ 
                        x: Math.random() * 100 + '%',
                        y: Math.random() * 100 + '%',
                        scale: 0,
                        opacity: 0
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.1,
                        repeat: 1
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 text-4xl font-black relative z-10">
                  <motion.span
                    animate={{ 
                      rotate: [0, 360, 720],
                      scale: [1, 1.3, 1, 1.3, 1]
                    }}
                    transition={{ duration: 1.2, repeat: 2 }}
                    className="drop-shadow-lg"
                  >
                    {characterEmoji}
                  </motion.span>
                  <motion.span
                    animate={{ scale: [1, 1.1, 1, 1.1, 1] }}
                    transition={{ duration: 0.4, repeat: 5 }}
                    className="drop-shadow-lg"
                  >
                    {t('goodJob')}!
                  </motion.span>
                  <motion.span
                    animate={{ 
                      rotate: [0, -360, -720],
                      scale: [1, 1.4, 1, 1.4, 1]
                    }}
                    transition={{ duration: 1.2, repeat: 2 }}
                    className="drop-shadow-lg"
                  >
                    ⭐
                  </motion.span>
                </div>

                {/* Bonus particles flying out */}
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute text-3xl"
                    style={{
                      left: '50%',
                      top: '50%'
                    }}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                    animate={{
                      scale: [0, 1, 0.5],
                      opacity: [1, 1, 0],
                      x: Math.cos(i * 22.5 * Math.PI / 180) * 150,
                      y: Math.sin(i * 22.5 * Math.PI / 180) * 150,
                      rotate: [0, 360]
                    }}
                    transition={{ duration: 1.5, delay: i * 0.03 }}
                  >
                    {['🎉', '⭐', '✨', '🌟'][i % 4]}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:justify-between items-stretch md:items-center gap-3 md:gap-4 mb-6 md:mb-8"
        >
          <div className="flex items-center gap-3 md:gap-4 flex-wrap">
            <TokenCounter count={profile?.total_tokens || 0} />
            <StreakDisplay currentStreak={profile?.current_streak || 0} bestStreak={profile?.best_streak || 0} />
          </div>
          
          {allChildren.length > 1 && (
            <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/90 backdrop-blur-sm hover:bg-white border-2 md:border-4 border-purple-300 shadow-lg hover:shadow-xl font-bold md:font-black text-base md:text-lg rounded-2xl md:rounded-3xl py-3 md:py-4 w-full md:w-auto">
                  <Users className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                  <span>{t('switchChild')}</span>
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-2 md:border-4 border-purple-200 rounded-xl md:rounded-2xl">
                {allChildren.map(child => (
                  <DropdownMenuItem key={child.id} onSelect={() => handleChildSwitch(child.id)} className="text-base md:text-lg font-bold">
                    {child.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-2xl border-0 overflow-hidden relative rounded-[3rem]">
            <div className="absolute inset-0 opacity-20">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-6xl"
                  animate={{
                    x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                    y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                    rotate: [0, 360],
                    scale: [0.5, 1.5, 0.5]
                  }}
                  transition={{ duration: 10 + i, repeat: Infinity, delay: i * 0.5 }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                >
                  {characterEmoji}
                </motion.div>
              ))}
            </div>
            
            <CardContent className="relative p-4 md:p-8 lg:p-12">
              <div className="flex flex-col items-center gap-4 md:gap-6">
                <div className="text-center w-full">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 flex flex-col md:flex-row items-center gap-2 md:gap-4 justify-center"
                  >
                    <motion.span
                      animate={{ 
                        rotate: [0, 20, -20, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-5xl md:text-7xl"
                    >
                      {characterEmoji}
                    </motion.span>
                    <span className="drop-shadow-lg">
                      {profile?.name ? t('hiWithName', { name: profile.name }) : t('dashboard')}
                    </span>
                  </motion.h2>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col md:flex-row items-center gap-2 md:gap-3 justify-center text-lg md:text-2xl bg-white/20 backdrop-blur-sm rounded-2xl md:rounded-3xl px-4 md:px-6 py-3 md:py-4"
                  >
                    <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-300" />
                    <span className="font-black text-center">
                      {t('youHaveCompleted')} <span className="text-yellow-300 text-2xl md:text-3xl">{totalCompletedTasks}</span> {t('tasksToday')}
                    </span>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="relative hidden md:block"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-9xl"
                  >
                    {characterEmoji}
                  </motion.div>
                  <Badge className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-purple-900 px-6 py-2 text-xl font-black border-4 border-white shadow-xl rounded-2xl">
                    <Target className="w-5 h-5 mr-2" />
                    {tasks.length - completedToday.length} {t('tasksLeft')}
                  </Badge>
                </motion.div>
                
                <Badge className="md:hidden bg-yellow-400 text-purple-900 px-4 py-2 text-base font-black border-2 border-white shadow-lg rounded-xl">
                  <Target className="w-4 h-4 mr-2" />
                  {tasks.length - completedToday.length} {t('tasksLeft')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {morningTasks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <motion.div 
              className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-lg flex-shrink-0"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sun className="w-7 h-7 md:w-10 md:h-10 text-orange-500" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-3xl font-black text-white drop-shadow-lg leading-tight">{t('morningTasks')} ☀️</h3>
                <p className="text-sm md:text-xl text-white/90 font-bold">{t('startDayRight')}</p>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {morningTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  {task.input_type === 'timer' ? (
                    <TimerTaskCard
                      task={task}
                      isCompleted={completedToday.some(c => c.task_id === task.id)}
                      onComplete={handleTaskComplete}
                      displayMode={displayMode}
                      className="shadow-xl hover:shadow-2xl"
                    />
                  ) : (
                    <TaskCard
                      task={task}
                      isCompleted={completedToday.some(c => c.task_id === task.id)}
                      onComplete={task.input_type === 'text' ? () => setTaskForInput(task) : handleTaskComplete}
                      displayMode={displayMode}
                      className="shadow-xl hover:shadow-2xl"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {homeworkTasksToday.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <motion.div 
              className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-lg flex-shrink-0"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <BookOpen className="w-7 h-7 md:w-10 md:h-10 text-purple-600" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-3xl font-black text-white drop-shadow-lg leading-tight">{t('afternoonTasks')} 📚</h3>
                <p className="text-sm md:text-xl text-white/90 font-bold">{t('studyTime')}</p>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Homework Timer - 1 column */}
              <div className="lg:col-span-1">
                <HomeworkTimer onComplete={async () => {
                  try {
                    const newTokens = (profile?.total_tokens || 0) + 5;
                    await base44.entities.ChildProfile.update(profile.id, {
                      total_tokens: newTokens
                    });
                    setProfile({ ...profile, total_tokens: newTokens });
                    setShowCelebration(true);
                    setTimeout(() => setShowCelebration(false), 3000);
                  } catch (error) {
                    console.error('Error updating tokens:', error);
                  }
                }} />
              </div>
              
              {/* Homework Cards - 3 columns */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {homeworkTasksToday.map((homework, index) => {
                  const subject = subjects.find(s => s.id === homework.subject_id);
                  return (
                    <motion.div
                      key={homework.id}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, rotate: -2 }}
                    >
                      <HomeworkCard
                        homework={homework}
                        subject={subject}
                        onComplete={handleHomeworkComplete}
                        displayMode={displayMode}
                        className="shadow-xl hover:shadow-2xl"
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}

        {(tomorrowHomeworkTasks.length > 0 || tomorrowSchedule.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-8"
          >
            <motion.div 
              className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 bg-gradient-to-r from-teal-500 to-cyan-600 p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-lg flex-shrink-0"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Briefcase className="w-7 h-7 md:w-10 md:h-10 text-teal-600" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-3xl font-black text-white drop-shadow-lg leading-tight">{t('afternoonTasks')} - {t('prepareForTomorrow')} 🎒</h3>
                <p className="text-sm md:text-xl text-white/90 font-bold">{t('prepareForTomorrow')}</p>
              </div>
            </motion.div>

            {/* Tomorrow's Bag List Button */}
            <Button
              onClick={() => setShowBackpackPrep(true)}
              className="bg-white text-teal-600 hover:bg-teal-50 font-bold text-base md:text-lg px-4 md:px-6 py-4 md:py-6 rounded-2xl shadow-lg hover:shadow-xl w-full mb-4"
            >
              📋 {t('tomorrowBagList')}
            </Button>

            {/* Tomorrow's Homework */}
            {tomorrowHomeworkTasks.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-3 px-2">
                  {t('tomorrowHomework')} 📝
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tomorrowHomeworkTasks.map((homework, index) => {
                    const subject = subjects.find(s => s.id === homework.subject_id);
                    return (
                      <Card key={homework.id} className="bg-white/90 backdrop-blur-sm border-2 border-teal-200 shadow-lg">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {subject && (
                              <div
                                style={{ backgroundColor: subject.color }}
                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              >
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm md:text-base">{subject?.name}</p>
                              <p className="text-xs md:text-sm text-gray-600 mt-1">{homework.title}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tomorrow's Schedule - Required Materials */}
            {tomorrowSchedule.length > 0 && (
              <div>
                <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-3 px-2">
                  {t('whatToPrepareForTomorrow')} 📚
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tomorrowSchedule.map((schedule) => {
                    const subject = subjects.find(s => s.id === schedule.subject_id);
                    if (!subject || !subject.required_materials || subject.required_materials.length === 0) return null;
                    return (
                      <Card key={schedule.id} className="bg-white/90 backdrop-blur-sm border-2 border-cyan-200 shadow-lg">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              style={{ backgroundColor: subject.color }}
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            >
                              <Icon name={subject.icon} className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm md:text-base">{subject.name}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {subject.required_materials.map((material, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {material}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {backpackTasks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <div className="space-y-4 mb-6">
              <motion.div 
                className="flex items-center gap-3 md:gap-4 bg-gradient-to-r from-green-500 to-emerald-600 p-4 md:p-6 rounded-[2rem] shadow-xl"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-lg flex-shrink-0"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Briefcase className="w-7 h-7 md:w-10 md:h-10 text-green-600" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl md:text-3xl font-black text-white drop-shadow-lg leading-tight">{t('backpackAndTomorrowPrep')} 🎒</h3>
                  <p className="text-sm md:text-xl text-white/90 font-bold">{t('prepareForTomorrow')}</p>
                </div>
              </motion.div>
              <Button
                onClick={() => setShowBackpackPrep(true)}
                className="bg-white text-green-600 hover:bg-green-50 font-bold text-base md:text-lg px-4 md:px-6 py-4 md:py-6 rounded-2xl shadow-lg hover:shadow-xl w-full"
              >
                📋 {t('tomorrowBagList')}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {backpackTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <TaskCard
                    task={task}
                    isCompleted={completedToday.some(c => c.task_id === task.id)}
                    onComplete={() => {setTaskForBackpack(task); setShowBackpackModal(true);}}
                    displayMode={displayMode}
                    className="shadow-xl hover:shadow-2xl"
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {eveningTasks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <motion.div 
              className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 bg-gradient-to-r from-indigo-600 to-purple-700 p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-lg flex-shrink-0"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Moon className="w-7 h-7 md:w-10 md:h-10 text-indigo-600" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-3xl font-black text-white drop-shadow-lg leading-tight">{t('eveningTasks')} 🌙</h3>
                <p className="text-sm md:text-xl text-white/90 font-bold">{t('endDayRight')}</p>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {eveningTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: -2 }}
                >
                  {task.input_type === 'timer' ? (
                    <TimerTaskCard
                      task={task}
                      isCompleted={completedToday.some(c => c.task_id === task.id)}
                      onComplete={handleTaskComplete}
                      displayMode={displayMode}
                      className="shadow-xl hover:shadow-2xl"
                    />
                  ) : (
                    <TaskCard
                      task={task}
                      isCompleted={completedToday.some(c => c.task_id === task.id)}
                      onComplete={task.input_type === 'text' ? () => setTaskForInput(task) : handleTaskComplete}
                      displayMode={displayMode}
                      className="shadow-xl hover:shadow-2xl"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {timedTasks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mb-8"
          >
            <motion.div 
              className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 bg-gradient-to-r from-blue-500 to-cyan-600 p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-lg flex-shrink-0"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-7 h-7 md:w-10 md:h-10 text-blue-600" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-3xl font-black text-white drop-shadow-lg leading-tight">{t('timedTasks')} ⏱️</h3>
                <p className="text-sm md:text-xl text-white/90 font-bold">{t('timeForFocus')}</p>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {timedTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <TimerTaskCard
                    task={task}
                    isCompleted={completedToday.some(c => c.task_id === task.id)}
                    onComplete={handleTaskComplete}
                    displayMode={displayMode}
                    className="shadow-xl hover:shadow-2xl"
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {starTasks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <motion.div 
              className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-lg flex-shrink-0"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <StarIcon className="w-7 h-7 md:w-10 md:h-10 text-yellow-500 fill-current" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-3xl font-black text-white drop-shadow-lg leading-tight">{t('starTasks')} ⭐</h3>
                <p className="text-sm md:text-xl text-white/90 font-bold">{t('specialTasks')}</p>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {starTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 3 }}
                >
                  <StarTaskCard
                    task={task}
                    isCompleted={completedToday.some(c => c.task_id === task.id)}
                    onComplete={task.input_type === 'text' ? () => setTaskForInput(task) : handleTaskComplete}
                    displayMode={displayMode}
                    className="shadow-xl hover:shadow-2xl"
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {challenges.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-8"
          >
            <motion.div 
              className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 bg-gradient-to-r from-pink-500 to-purple-600 p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl md:rounded-[1.5rem] flex items-center justify-center shadow-lg flex-shrink-0"
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ChevronsRight className="w-7 h-7 md:w-10 md:h-10 text-pink-600" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl md:text-3xl font-black text-white drop-shadow-lg leading-tight">{t('challenges')} 🏆</h3>
                <p className="text-sm md:text-xl text-white/90 font-bold">{t('specialChallenges')}</p>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((challenge, index) => {
                const isClaimed = completedChallenges.some(cc => cc.challenge_id === challenge.id);
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <ChallengeCard
                      challenge={challenge}
                      completedTasksCount={completedToday.length}
                      isClaimed={isClaimed}
                      onClaim={handleClaimChallenge}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {morningTasks.length === 0 && homeworkTasksToday.length === 0 && backpackTasks.length === 0 && eveningTasks.length === 0 && starTasks.length === 0 && timedTasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <Card className="bg-gradient-to-br from-green-400 to-emerald-500 border-0 shadow-2xl max-w-2xl mx-auto rounded-3xl md:rounded-[3rem] overflow-hidden">
              <CardContent className="p-6 md:p-12">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-6xl md:text-9xl mb-4 md:mb-6"
                >
                  {characterEmoji}
                </motion.div>
                <h3 className="text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 drop-shadow-lg">{t('allTasksCompleted')} 🌟</h3>
                <p className="text-xl md:text-3xl text-white font-bold mb-6 md:mb-10 drop-shadow-md">{t('greatJobToday')} 👏</p>
                <Link to={createPageUrl("ParentPanel")}>
                  <Button className="bg-white text-green-600 hover:bg-gray-100 font-black text-lg md:text-2xl py-4 md:py-6 px-8 md:px-12 rounded-2xl md:rounded-[2rem] shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 w-full md:w-auto">
                    ➕ {t('addTasks')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
      </div>
    </PullToRefresh>
  );
}