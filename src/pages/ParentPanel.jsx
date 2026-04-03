import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, Gift, Lightbulb, Target, Calendar, Settings as SettingsIcon, UserPlus, MessageCircle, Bell, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";

import TaskManagementTab from "../components/parent-panel/TaskManagementTab";
import RewardManagementTab from "../components/parent-panel/RewardManagementTab";
import WishlistManagementTab from "../components/parent-panel/WishlistManagementTab";
import ChallengeManagementTab from "../components/parent-panel/ChallengeManagementTab";
import ScheduleTab from "../components/parent-panel/ScheduleTab";
import SettingsTab from "../components/parent-panel/SettingsTab";
import ChildrenManagementTab from "../components/parent-panel/ChildrenManagementTab";
import IdeasTab from "../components/parent-panel/IdeasTab";
import FamilyShareTab from "../components/parent-panel/FamilyShareTab";
import HouseholdTasksTab from "../components/parent-panel/HouseholdTasksTab";

export default function ParentPanel() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  const [childProfiles, setChildProfiles] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [isPasswordLocked, setIsPasswordLocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const loadData = useCallback(async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Only primary parents can access ParentPanel
      const parentFamilies = await base44.entities.Family.filter({ primary_parent_email: currentUser.email });
      if (parentFamilies.length === 0) {
        navigate('/Dashboard');
        return;
      }

      // Ensure user has family_id
      if (!currentUser.family_id) {
        console.warn('User missing family_id, checking for existing family...');
        
        // Check if family exists
        const families = await base44.entities.Family.filter({ 
          primary_parent_email: currentUser.email 
        });
        
        let familyId;
        if (families.length > 0) {
          familyId = families[0].id;
          // Update user with family_id
          await base44.auth.updateMe({ family_id: familyId });
          currentUser.family_id = familyId;
          setUser(currentUser); // Update user state with new family_id
        }
      }

      // Load family data and check for password protection
      if (currentUser.family_id) {
        const family = await base44.entities.Family.filter({ id: currentUser.family_id });
        if (family.length > 0) {
          setFamilyData(family[0]);
          
          // Check if password is set and panel is locked
          const hasPassword = family[0].parent_panel_password;
          const isUnlocked = sessionStorage.getItem('parentPanelUnlocked') === currentUser.family_id;

          if (hasPassword && !isUnlocked) {
            setIsPasswordLocked(true);
            setIsLoading(false);
            return; // Stop loading other data until password is verified
          }
        }
      }

      const [childrenData, tasksData, rewardsData, subjectsData, schedulesData, wishlistData, challengesData] = await Promise.all([
        base44.entities.ChildProfile.filter({ created_by: currentUser.email }),
        base44.entities.Task.filter({ created_by: currentUser.email }),
        base44.entities.Reward.filter({ created_by: currentUser.email }),
        base44.entities.Subject.filter({ created_by: currentUser.email }),
        base44.entities.Schedule.filter({ created_by: currentUser.email }),
        base44.entities.WishlistItem.filter({ created_by: currentUser.email }),
        base44.entities.Challenge.filter({ created_by: currentUser.email })
      ]);

      setChildProfiles(childrenData);
      setTasks(tasksData);
      setRewards(rewardsData);
      setSubjects(subjectsData);
      setSchedules(schedulesData);
      setWishlistItems(wishlistData);
      setChallenges(challengesData);

      if (childrenData.length > 0 && !selectedChildId) {
        setSelectedChildId(childrenData[0].id);
      } else if (childrenData.length === 0) {
        setSelectedChildId(null); // No children, so no child selected
      } else if (selectedChildId && !childrenData.some(child => child.id === selectedChildId)) {
        // If the previously selected child was deleted, select the first one or null
        setSelectedChildId(childrenData[0]?.id || null);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTaskAdded = useCallback(async () => {
    const tasksData = await base44.entities.Task.filter({ created_by: user.email });
    setTasks(tasksData);
  }, [user]);

  const handleTaskDeleted = useCallback(async () => {
    const tasksData = await base44.entities.Task.filter({ created_by: user.email });
    setTasks(tasksData);
  }, [user]);

  const handleRewardAdded = useCallback(async () => {
    const rewardsData = await base44.entities.Reward.filter({ created_by: user.email });
    setRewards(rewardsData);
  }, [user]);

  const handleRewardDeleted = useCallback(async () => {
    const rewardsData = await base44.entities.Reward.filter({ created_by: user.email });
    setRewards(rewardsData);
  }, [user]);

  const handleWishlistAdded = useCallback(async () => {
    const wishlistData = await base44.entities.WishlistItem.filter({ created_by: user.email });
    setWishlistItems(wishlistData);
  }, [user]);

  const handleWishlistDeleted = useCallback(async () => {
    const wishlistData = await base44.entities.WishlistItem.filter({ created_by: user.email });
    setWishlistItems(wishlistData);
  }, [user]);

  const handleWishlistUpdate = useCallback(async (itemId, updates) => {
    await base44.entities.WishlistItem.update(itemId, updates);
    await handleWishlistAdded();
  }, [handleWishlistAdded]);

  const handleSubjectAdded = useCallback(async () => {
    const subjectsData = await base44.entities.Subject.filter({ created_by: user.email });
    setSubjects(subjectsData);
  }, [user]);

  const handleSubjectDeleted = useCallback(async () => {
    const subjectsData = await base44.entities.Subject.filter({ created_by: user.email });
    setSubjects(subjectsData);
  }, [user]);

  const handleScheduleAdded = useCallback(async () => {
    const schedulesData = await base44.entities.Schedule.filter({ created_by: user.email });
    setSchedules(schedulesData);
  }, [user]);

  const handleScheduleDeleted = useCallback(async () => {
    const schedulesData = await base44.entities.Schedule.filter({ created_by: user.email });
    setSchedules(schedulesData);
  }, [user]);

  const handleAddChallenge = useCallback(async (challengeData) => {
    await base44.entities.Challenge.create(challengeData);
    const challengesData = await base44.entities.Challenge.filter({ created_by: user.email });
    setChallenges(challengesData);
  }, [user]);

  const handleDeleteChallenge = useCallback(async (challengeId) => {
    if (window.confirm(t('confirmDelete', { item: t('challenges') }))) {
      await base44.entities.Challenge.delete(challengeId);
      const challengesData = await base44.entities.Challenge.filter({ created_by: user.email });
      setChallenges(challengesData);
    }
  }, [user, t]);

  const pendingWishlistCount = wishlistItems.filter(item => item.status === 'requested').length;

  const handlePasswordSubmit = () => {
    if (passwordInput === familyData?.parent_panel_password) {
      sessionStorage.setItem('parentPanelUnlocked', user.family_id);
      setIsPasswordLocked(false);
      setPasswordInput('');
      setIsLoading(true);
      loadData();
    } else {
      alert(isRTL ? 'סיסמה שגויה' : 'Incorrect password');
      setPasswordInput('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-5xl md:text-6xl"
        >
          ⚙️
        </motion.div>
      </div>
    );
  }

  // Password Lock Screen
  if (isPasswordLocked) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center"
            >
              <span className="text-5xl">🔒</span>
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">{isRTL ? 'פאנל הורים מוגן' : 'Protected Parent Panel'}</h2>
            <p className="text-gray-600 mb-6">{isRTL ? 'הזן סיסמה לגישה לפאנל' : 'Enter password to access panel'}</p>
            
            <div className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder={isRTL ? 'הזן סיסמה' : 'Enter password'}
                className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg text-lg text-center"
                autoFocus
              />
              <Button
                onClick={handlePasswordSubmit}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 min-h-[44px]"
              >
                {isRTL ? 'כניסה' : 'Enter'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="w-full min-h-[44px]"
              >
                {isRTL ? 'חזור לדף הבית' : 'Back to Dashboard'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main content (dashboard or tab view)
  const renderContent = () => {
    // Dashboard view (when no tab is selected)
    if (!activeTab) {
      return (
        <div className={`min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link to={createPageUrl("Dashboard")}>
                <Button variant="ghost" className="mb-4 min-h-[44px]">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {t('backToDashboard')}
                </Button>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{t('parentPanel')}</h1>
              <p className="text-gray-600 text-lg">{t('manageFamilySettings')}</p>
            </div>

          {/* Child Selector */}
          {childProfiles.length > 0 && (
            <Card className="mb-8 shadow-lg border-2 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{t('selectChild')}</p>
                    <Select value={selectedChildId || ''} onValueChange={setSelectedChildId}>
                      <SelectTrigger className="w-full border-0 p-0 h-auto font-bold text-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {childProfiles.map(child => (
                          <SelectItem key={child.id} value={child.id} className="text-lg">
                            {child.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Wishlist Alert */}
          {pendingWishlistCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card 
                className="bg-gradient-to-r from-pink-500 to-purple-600 border-0 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
                onClick={() => setActiveTab('wishlist')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-3xl animate-pulse">✨</span>
                      </div>
                      <div>
                        <p className="font-bold text-lg">
                          {t('newWishesToApprove', { count: pendingWishlistCount })}
                        </p>
                        <p className="text-sm text-white/80">{t('clickToViewApprove')}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Actions Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('managementActions')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all border-2 border-purple-200 h-full min-h-[120px]"
                  onClick={() => setActiveTab('rewards')}
                >
                  <CardContent className="p-6 text-center min-h-[44px] flex flex-col justify-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center">
                      <span className="text-4xl">🎁</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{t('rewardsShopTitle')}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t('rewardsShopDesc')}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all border-2 border-yellow-200 h-full min-h-[120px]"
                  onClick={() => setActiveTab('ideas')}
                >
                  <CardContent className="p-6 text-center min-h-[44px] flex flex-col justify-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                      <span className="text-4xl">💡</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{t('ideasBankTitle')}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t('ideasBankDesc')}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all border-2 border-blue-200 h-full min-h-[120px]"
                  onClick={() => setActiveTab('tasks')}
                >
                  <CardContent className="p-6 text-center min-h-[44px] flex flex-col justify-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                      <span className="text-4xl">🎯</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{t('tasksManagementTitle')}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t('tasksManagementDesc')}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all border-2 border-green-200 h-full min-h-[120px]"
                  onClick={() => setActiveTab('schedule')}
                >
                  <CardContent className="p-6 text-center min-h-[44px] flex flex-col justify-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center">
                      <span className="text-4xl">📅</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{t('dailyScheduleTitle')}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t('dailyScheduleDesc')}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all border-2 border-indigo-200 h-full min-h-[120px]"
                  onClick={() => setActiveTab('household')}
                >
                  <CardContent className="p-6 text-center min-h-[44px] flex flex-col justify-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-2xl flex items-center justify-center">
                      <span className="text-4xl">🏠</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{t('householdManagementTitle')}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t('householdManagementDesc')}</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Settings & Connections */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('settingsAndConnections')}</h2>
            <Card className="shadow-lg">
              <CardContent className="p-4 space-y-2">
                <button
                  onClick={() => setActiveTab('familyShare')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px]"
                >
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                    <span className="text-2xl">👥</span>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="font-bold text-gray-800">{t('addParentTitle')}</p>
                      <p className="text-xs text-gray-600">{t('addParentDesc')}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => window.open(base44.agents.getWhatsAppConnectURL('task_reminder'), '_blank')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px]"
                >
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" fill="white" />
                    </div>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="font-bold text-gray-800">{t('whatsappAlertsTitle')}</p>
                      <p className="text-xs text-gray-600">{t('whatsappAlertsDesc')}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px]"
                >
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                    <span className="text-2xl">⚙️</span>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="font-bold text-gray-800">{t('appSettingsTitle')}</p>
                      <p className="text-xs text-gray-600">{t('appSettingsDesc')}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => setActiveTab('children')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px]"
                >
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                    <span className="text-2xl">👦</span>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <p className="font-bold text-gray-800">{t('childProfilesTitle')}</p>
                      <p className="text-xs text-gray-600">{t('childProfilesDesc')}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      );
    }

    // Tab view (when a tab is selected)
    return (
      <div className={`min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-2 md:p-4 lg:p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-8">
          <div className="w-full md:w-auto">
            <Button variant="ghost" className="mb-2 md:mb-4 min-h-[44px]" onClick={() => setActiveTab(null)}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('backToManagement')}
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 leading-tight">
              {activeTab === 'tasks' && t('tasksManagementTitle')}
              {activeTab === 'rewards' && t('rewardsShopTitle')}
              {activeTab === 'ideas' && t('ideasBankTitle')}
              {activeTab === 'wishlist' && t('pendingWishlistTitle')}
              {activeTab === 'challenges' && t('challenges')}
              {activeTab === 'schedule' && t('dailyScheduleTitle')}
              {activeTab === 'children' && t('childProfilesTitle')}
              {activeTab === 'settings' && t('appSettingsTitle')}
              {activeTab === 'familyShare' && t('addParentTitle')}
              {activeTab === 'household' && t('householdTasksTitle')}
            </h1>
          </div>

          {/* Child Selector */}
          {childProfiles.length > 0 && activeTab !== 'children' && activeTab !== 'settings' && activeTab !== 'household' && activeTab !== 'familyShare' && (
            <div className="w-full md:w-auto flex items-center gap-2 md:gap-3 bg-white p-2 md:p-4 rounded-lg md:rounded-2xl shadow-lg">
              <Users className="w-4 h-4 md:w-6 md:h-6 text-purple-600 flex-shrink-0" />
              <div className="flex-1 md:flex-initial min-w-0">
                <p className="text-xs md:text-sm text-gray-600 mb-0.5">{t('selectChild')}</p>
                <Select value={selectedChildId || ''} onValueChange={setSelectedChildId}>
                  <SelectTrigger className="w-full md:w-48 border-0 p-0 h-auto font-bold text-sm md:text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {childProfiles.map(child => (
                      <SelectItem key={child.id} value={child.id} className="text-sm md:text-base">
                        {child.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <Card className="shadow-2xl border-0">
          <CardContent className="p-2 md:p-6">
            {activeTab === 'tasks' && (
              <TaskManagementTab
                tasks={tasks}
                onTaskAdded={handleTaskAdded}
                onTaskDeleted={handleTaskDeleted}
                childProfiles={childProfiles}
                selectedChildId={selectedChildId}
              />
            )}

            {activeTab === 'rewards' && (
              <RewardManagementTab
                rewards={rewards}
                onRewardAdded={handleRewardAdded}
                onRewardDeleted={handleRewardDeleted}
                childProfiles={childProfiles}
                selectedChildId={selectedChildId}
              />
            )}

            {activeTab === 'ideas' && (
              <IdeasTab
                childProfiles={childProfiles}
                selectedChildId={selectedChildId}
                onDataChange={loadData}
              />
            )}

            {activeTab === 'wishlist' && (
              <WishlistManagementTab
                wishlistItems={wishlistItems}
                onWishlistAdded={handleWishlistAdded}
                onWishlistDeleted={handleWishlistDeleted}
                onWishlistUpdate={handleWishlistUpdate}
                onDataChange={loadData}
                childProfiles={childProfiles}
                selectedChildId={selectedChildId}
                rewards={rewards}
              />
            )}

            {activeTab === 'challenges' && (
              <ChallengeManagementTab
                challenges={challenges}
                onAddChallenge={handleAddChallenge}
                onDeleteChallenge={handleDeleteChallenge}
                childProfiles={childProfiles}
                selectedChildId={selectedChildId}
              />
            )}

            {activeTab === 'schedule' && (
              <ScheduleTab
                profile={childProfiles.find(c => c.id === selectedChildId)}
                subjects={subjects.filter(s => s.child_profile_id === selectedChildId)}
                schedules={schedules.filter(s => s.child_profile_id === selectedChildId)}
                onDataChange={loadData}
                showSuccessMessage={(msg) => alert(msg)}
              />
            )}

            {activeTab === 'children' && (
              <ChildrenManagementTab
                children={childProfiles}
                onDataChange={loadData}
                currentUser={user}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                childProfiles={childProfiles}
                onProfileUpdated={loadData}
                user={user}
                onNavigateToChildren={() => setActiveTab('children')}
                familyData={familyData}
                onFamilyUpdated={loadData}
              />
            )}

            {activeTab === 'familyShare' && (
              <FamilyShareTab
                user={user}
              />
            )}

            {activeTab === 'household' && (
              <HouseholdTasksTab
                profile={childProfiles.find(c => c.id === selectedChildId)}
                showSuccessMessage={(msg) => alert(msg)}
              />
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    );
  };

  return renderContent();
}