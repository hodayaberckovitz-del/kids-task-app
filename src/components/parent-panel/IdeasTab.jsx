import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Lightbulb, Plus, Sparkles, Users, User } from 'lucide-react';
import Icon from '../shared/Icon';
import { useLanguage } from '@/components/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function IdeasTab({ childProfiles = [], selectedChildId, onDataChange }) {
  const { t, isRTL, language } = useLanguage();
  const [selectedChild, setSelectedChild] = useState(selectedChildId || 'all');
  const [addingTask, setAddingTask] = useState(null);
  const [addingReward, setAddingReward] = useState(null);
  const [addingChallenge, setAddingChallenge] = useState(null);

  // Task ideas structure - translations via t()
  const TASK_IDEAS = [
    // Morning tasks
    { key: 'ideaTaskBrushTeeth', icon: 'Smile', color: '#3B82F6', task_type: 'morning', base_tokens: 1, category: 'morning' },
    { key: 'ideaTaskPackBag', icon: 'Briefcase', color: '#8B5CF6', task_type: 'morning', base_tokens: 2, category: 'morning' },
    { key: 'ideaTaskGetDressed', icon: 'Shirt', color: '#EC4899', task_type: 'morning', base_tokens: 1, category: 'morning' },
    { key: 'ideaTaskEatBreakfast', icon: 'Coffee', color: '#F59E0B', task_type: 'morning', base_tokens: 2, category: 'morning' },
    { key: 'ideaTaskMakeBed', icon: 'Bed', color: '#06B6D4', task_type: 'morning', base_tokens: 2, category: 'morning' },
    { key: 'ideaTaskWashFace', icon: 'Droplet', color: '#14B8A6', task_type: 'morning', base_tokens: 1, category: 'morning' },
    
    // Evening tasks
    { key: 'ideaTaskShower', icon: 'Bath', color: '#3B82F6', task_type: 'evening', base_tokens: 2, category: 'evening' },
    { key: 'ideaTaskTidyToys', icon: 'Home', color: '#10B981', task_type: 'evening', base_tokens: 3, category: 'evening' },
    { key: 'ideaTaskPrepareBag', icon: 'Briefcase', color: '#8B5CF6', task_type: 'evening', base_tokens: 2, category: 'evening' },
    { key: 'ideaTaskReadBook', icon: 'BookOpen', color: '#F59E0B', task_type: 'evening', base_tokens: 3, category: 'evening' },
    { key: 'ideaTaskSleepOnTime', icon: 'Moon', color: '#6366F1', task_type: 'evening', base_tokens: 2, category: 'evening' },
    
    // Star tasks
    { key: 'ideaTaskHelpCooking', icon: 'Flame', color: '#EF4444', task_type: 'star', star_tokens: 20, category: 'star' },
    { key: 'ideaTaskCleanRoom', icon: 'Sparkles', color: '#8B5CF6', task_type: 'star', star_tokens: 25, category: 'star' },
    { key: 'ideaTaskHelpSibling', icon: 'Users', color: '#EC4899', task_type: 'star', star_tokens: 20, category: 'star' },
    { key: 'ideaTaskWaterPlants', icon: 'Droplet', color: '#10B981', task_type: 'star', star_tokens: 15, category: 'star' },
    { key: 'ideaTaskExtraMath', icon: 'Target', color: '#3B82F6', task_type: 'star', star_tokens: 30, category: 'star' },
    { key: 'ideaTaskOrganizeCloset', icon: 'Home', color: '#F59E0B', task_type: 'star', star_tokens: 25, category: 'star' },
    { key: 'ideaTaskWashDishes', icon: 'Droplets', color: '#06B6D4', task_type: 'star', star_tokens: 20, category: 'star' },
    { key: 'ideaTaskHelpGroceries', icon: 'ShoppingBag', color: '#10B981', task_type: 'star', star_tokens: 25, category: 'star' },
    { key: 'ideaTaskWalkDog', icon: 'Dog', color: '#F97316', task_type: 'star', star_tokens: 20, category: 'star' },
    { key: 'ideaTaskReadToSibling', icon: 'BookHeart', color: '#EC4899', task_type: 'star', star_tokens: 25, category: 'star' },
    { key: 'ideaTaskOrganizeBooks', icon: 'Library', color: '#8B5CF6', task_type: 'star', star_tokens: 20, category: 'star' },
    { key: 'ideaTaskHelpLaundry', icon: 'Shirt', color: '#3B82F6', task_type: 'star', star_tokens: 20, category: 'star' },
    
    // Timed tasks
    { key: 'ideaTaskStudy30', icon: 'BookOpen', color: '#8B5CF6', task_type: 'timed', duration_minutes: 30, timed_tokens: 15, category: 'timed' },
    { key: 'ideaTaskPracticeInstrument', icon: 'Music', color: '#EC4899', task_type: 'timed', duration_minutes: 20, timed_tokens: 12, category: 'timed' },
    { key: 'ideaTaskDrawCreate', icon: 'Palette', color: '#F59E0B', task_type: 'timed', duration_minutes: 25, timed_tokens: 10, category: 'timed' },
    { key: 'ideaTaskSportsActivity', icon: 'Activity', color: '#10B981', task_type: 'timed', duration_minutes: 30, timed_tokens: 15, category: 'timed' },
  ];

  // Reward ideas structure - translations via t()
  const REWARD_IDEAS = [
    { key: 'ideaRewardScreenTime', cost: 50, category: 'time' },
    { key: 'ideaRewardChooseDinner', cost: 30, category: 'food' },
    { key: 'ideaRewardParkTrip', cost: 100, category: 'activity' },
    { key: 'ideaRewardIceCream', cost: 40, category: 'food' },
    { key: 'ideaRewardSleepover', cost: 150, category: 'activity' },
    { key: 'ideaRewardSmallToy', cost: 200, category: 'shopping' },
    { key: 'ideaRewardFamilyGame', cost: 80, category: 'activity' },
    { key: 'ideaRewardMovie', cost: 120, category: 'activity' },
    { key: 'ideaRewardNewBook', cost: 100, category: 'shopping' },
    { key: 'ideaRewardCraftKit', cost: 150, category: 'shopping' },
    { key: 'ideaRewardPizzaFriends', cost: 180, category: 'food' },
    { key: 'ideaRewardChooseActivity', cost: 250, category: 'activity' },
  ];

  // Challenge ideas structure - translations via t()
  const CHALLENGE_IDEAS = [
    { key: 'ideaChallengeRun5km', tracking_type: 'distance', tracking_unit: 'ק״מ', target_value: 5, token_bonus: 100, duration_days: 30 },
    { key: 'ideaChallengeRead10Books', tracking_type: 'count', tracking_unit: 'ספרים', target_value: 10, token_bonus: 150, duration_days: 60 },
    { key: 'ideaChallengeStudy20Hours', tracking_type: 'time', tracking_unit: 'שעות', target_value: 20, token_bonus: 120, duration_days: 30 },
    { key: 'ideaChallengePracticeInstrument', tracking_type: 'time', tracking_unit: 'דקות', target_value: 600, token_bonus: 100, duration_days: 30 },
    { key: 'ideaChallengeDrinkWater', tracking_type: 'count', tracking_unit: isRTL ? 'כוסות' : 'glasses', target_value: 240, token_bonus: 80, duration_days: 30 },
    { key: 'ideaChallengeExercise', tracking_type: 'count', tracking_unit: 'אימונים', target_value: 20, token_bonus: 100, duration_days: 30 },
  ];

  const handleAddTask = async (idea) => {
    if (!selectedChild) {
      alert(t('ideasPleaseSelectChild'));
      return;
    }

    const title = t(idea.key);
    setAddingTask(title);

    try {
      const user = await base44.auth.me();
      const targetChildren = selectedChild === 'all' 
        ? childProfiles 
        : childProfiles.filter(c => c.id === selectedChild);

      if (targetChildren.length === 0) {
        alert(t('ideasNoChildFound'));
        return;
      }

      for (const child of targetChildren) {
        const taskData = {
          title: title,
          icon: idea.icon,
          color: idea.color,
          task_type: idea.task_type,
          base_tokens: idea.base_tokens || 1,
          star_tokens: idea.star_tokens || 15,
          duration_minutes: idea.duration_minutes || 15,
          timed_tokens: idea.timed_tokens || 10,
          input_type: 'checkbox',
          is_active: true,
          language: language, // Added language
          child_profile_id: child.id,
          family_id: child.family_id || user.family_id,
          order: 999
        };

        await base44.entities.Task.create(taskData);
      }

      if (onDataChange) {
        await onDataChange();
      }

      alert(t('ideasTaskAddedSuccess', { title }));
    } catch (error) {
      console.error('Error adding task:', error);
      alert(t('errorSavingTask'));
    } finally {
      setAddingTask(null);
    }
  };

  const handleAddReward = async (idea) => {
    if (!selectedChild) {
      alert(t('ideasPleaseSelectChild'));
      return;
    }

    const title = t(idea.key);
    setAddingReward(title);

    try {
      const user = await base44.auth.me();
      const targetChildren = selectedChild === 'all' 
        ? childProfiles 
        : childProfiles.filter(c => c.id === selectedChild);

      if (targetChildren.length === 0) {
        alert(t('ideasNoChildFound'));
        return;
      }

      for (const child of targetChildren) {
        const rewardData = {
          title: title,
          description: '',
          cost: idea.cost,
          is_claimed: false,
          language: language, // Added language
          child_profile_id: child.id,
          family_id: child.family_id || user.family_id
        };

        await base44.entities.Reward.create(rewardData);
      }

      if (onDataChange) {
        await onDataChange();
      }

      alert(t('ideasRewardAddedSuccess', { title }));
    } catch (error) {
      console.error('Error adding reward:', error);
      alert(t('errorSavingReward'));
    } finally {
      setAddingReward(null);
    }
  };

  const handleAddChallenge = async (idea) => {
    if (!selectedChild) {
      alert(t('ideasPleaseSelectChild'));
      return;
    }

    const title = t(idea.key);
    setAddingChallenge(title);

    try {
      const user = await base44.auth.me();
      const targetChildren = selectedChild === 'all' 
        ? childProfiles 
        : childProfiles.filter(c => c.id === selectedChild);

      if (targetChildren.length === 0) {
        alert(t('ideasNoChildFound'));
        return;
      }

      for (const child of targetChildren) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + idea.duration_days);

        const challengeData = {
          title: title,
          description: '',
          token_bonus: idea.token_bonus,
          type: 'progress_tracking',
          tracking_type: idea.tracking_type,
          tracking_unit: idea.tracking_unit,
          target_value: idea.target_value,
          current_progress: 0,
          expires_at: expiresAt.toISOString(),
          is_active: true,
          child_profile_id: child.id,
          family_id: child.family_id || user.family_id
        };

        await base44.entities.Challenge.create(challengeData);
      }

      if (onDataChange) {
        await onDataChange();
      }

      alert(t('ideasChallengeAddedSuccess', { title }) || `האתגר "${title}" נוסף בהצלחה! 🎯`);
    } catch (error) {
      console.error('Error adding challenge:', error);
      alert(t('errorSavingChallenge') || 'שגיאה בשמירת האתגר');
    } finally {
      setAddingChallenge(null);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 leading-tight">
            💡 {t('ideasTitle')}
          </h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 leading-tight">
            {t('ideasDescription')}
          </p>
        </div>
      </div>

      {/* Child Selector */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <label className="font-semibold text-sm md:text-base text-gray-700 whitespace-nowrap">
              {t('ideasAddFor')}
            </label>
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{t('ideasAllChildren')}</span>
                  </div>
                </SelectItem>
                {childProfiles.map(child => (
                  <SelectItem key={child.id} value={child.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{child.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks" className="text-xs sm:text-sm md:text-lg px-2 md:px-4">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            <span className="hidden md:inline">{t('ideasTaskIdeas')}</span>
            <span className="md:hidden">{t('tasks')}</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="text-xs sm:text-sm md:text-lg px-2 md:px-4">
            <Lightbulb className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            <span className="hidden md:inline">{t('ideasRewardIdeas')}</span>
            <span className="md:hidden">{t('rewards')}</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="text-xs sm:text-sm md:text-lg px-2 md:px-4">
            <span className="text-base md:text-xl mr-1 md:mr-2">🎯</span>
            <span className="hidden md:inline">{t('ideasChallengeIdeas') || 'רעיונות לאתגרים'}</span>
            <span className="md:hidden">{t('challenges')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6 mt-6">
          {/* Morning Tasks */}
          <div>
            <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ☀️ {t('ideasMorningTasksTitle')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TASK_IDEAS.filter(t => t.category === 'morning').map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: idea.color }}
                        >
                          <Icon name={idea.icon} className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm md:text-base text-gray-800 mb-1 leading-tight">{t(idea.key)}</h5>
                          <Badge className="bg-blue-100 text-blue-800 mb-2 text-xs">
                            🪙 {idea.base_tokens}
                          </Badge>
                          <Button
                            onClick={() => handleAddTask(idea)}
                            disabled={addingTask === t(idea.key)}
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-xs md:text-sm h-8 md:h-9"
                          >
                            {addingTask === t(idea.key) ? (
                              t('ideasAdding')
                            ) : (
                              <>
                                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                {t('add')}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Evening Tasks */}
          <div>
            <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🌙 {t('ideasEveningTasksTitle')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TASK_IDEAS.filter(t => t.category === 'evening').map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: idea.color }}
                        >
                          <Icon name={idea.icon} className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm md:text-base text-gray-800 mb-1 leading-tight">{t(idea.key)}</h5>
                          <Badge className="bg-indigo-100 text-indigo-800 mb-2 text-xs">
                            🪙 {idea.base_tokens}
                          </Badge>
                          <Button
                            onClick={() => handleAddTask(idea)}
                            disabled={addingTask === t(idea.key)}
                            size="sm"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs md:text-sm h-8 md:h-9"
                          >
                            {addingTask === t(idea.key) ? (
                              t('ideasAdding')
                            ) : (
                              <>
                                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                {t('add')}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Star Tasks */}
          <div>
            <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ⭐ {t('ideasStarTasksTitle')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TASK_IDEAS.filter(t => t.category === 'star').map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow border-2 border-yellow-200">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: idea.color }}
                        >
                          <Icon name={idea.icon} className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm md:text-base text-gray-800 mb-1 leading-tight">{t(idea.key)}</h5>
                          <Badge className="bg-yellow-100 text-yellow-800 mb-2 text-xs">
                            ⭐ {idea.star_tokens}
                          </Badge>
                          <Button
                            onClick={() => handleAddTask(idea)}
                            disabled={addingTask === t(idea.key)}
                            size="sm"
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-xs md:text-sm h-8 md:h-9"
                          >
                            {addingTask === t(idea.key) ? (
                              t('ideasAdding')
                            ) : (
                              <>
                                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                {t('add')}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Timed Tasks */}
          <div>
            <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ⏱️ {t('ideasTimedTasksTitle')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TASK_IDEAS.filter(t => t.category === 'timed').map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: idea.color }}
                        >
                          <Icon name={idea.icon} className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm md:text-base text-gray-800 mb-1 leading-tight">{t(idea.key)}</h5>
                          <div className="flex gap-2 mb-2 flex-wrap">
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              🪙 {idea.timed_tokens}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              ⏱️ {idea.duration_minutes} {t('minutes')}
                            </Badge>
                          </div>
                          <Button
                            onClick={() => handleAddTask(idea)}
                            disabled={addingTask === t(idea.key)}
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700 text-xs md:text-sm h-8 md:h-9"
                          >
                            {addingTask === t(idea.key) ? (
                              t('ideasAdding')
                            ) : (
                              <>
                                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                {t('add')}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6 mt-6">
          {['time', 'food', 'activity', 'shopping'].map((category) => (
            <div key={category}>
              <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                {category === 'time' && `⏰ ${t('ideasCategoryTime')}`}
                {category === 'food' && `🍕 ${t('ideasCategoryFood')}`}
                {category === 'activity' && `🎮 ${t('ideasCategoryActivity')}`}
                {category === 'shopping' && `🛍️ ${t('ideasCategoryShopping')}`}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {REWARD_IDEAS.filter(r => r.category === category).map((idea, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-3 md:p-4">
                        <div className="space-y-3">
                          <h5 className="font-bold text-sm md:text-base text-gray-800 leading-tight">{t(idea.key)}</h5>
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            🪙 {idea.cost}
                          </Badge>
                          <Button
                            onClick={() => handleAddReward(idea)}
                            disabled={addingReward === t(idea.key)}
                            size="sm"
                            className="w-full bg-orange-600 hover:bg-orange-700 text-xs md:text-sm h-8 md:h-9"
                          >
                            {addingReward === t(idea.key) ? (
                              t('ideasAdding')
                            ) : (
                              <>
                                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                {t('add')}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6 mt-6">
          <div>
            <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🎯 {t('ideasChallengeIdeas') || 'רעיונות לאתגרים'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHALLENGE_IDEAS.map((idea, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow border-2 border-purple-200">
                    <CardContent className="p-3 md:p-4">
                      <div className="space-y-3">
                        <h5 className="font-bold text-sm md:text-base text-gray-800 leading-tight">{t(idea.key)}</h5>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            🎯 {idea.target_value} {idea.tracking_unit}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            🪙 {idea.token_bonus}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            📅 {idea.duration_days} {isRTL ? 'ימים' : 'days'}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handleAddChallenge(idea)}
                          disabled={addingChallenge === t(idea.key)}
                          size="sm"
                          className="w-full bg-purple-600 hover:bg-purple-700 text-xs md:text-sm h-8 md:h-9"
                        >
                          {addingChallenge === t(idea.key) ? (
                            t('ideasAdding')
                          ) : (
                            <>
                              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                              {t('add')}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}