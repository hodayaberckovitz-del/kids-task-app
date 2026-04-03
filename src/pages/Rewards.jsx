import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Gift, WifiOff, Dices, Brain, Sparkles } from "lucide-react";

import RewardCard from "../components/RewardCard";
import TokenCounter from "../components/TokenCounter";
import SavingsBank from "../components/SavingsBank";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageContext";
import RouletteWheel from "@/components/RouletteWheel";
import MemoryGame from "@/components/MemoryGame";
import confetti from "canvas-confetti";
import { ArrowLeft, PiggyBank } from "lucide-react";
import UpgradeModal from "@/components/UpgradeModal";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const GAMES = [
  {
    id: 'roulette',
    icon: Dices,
    nameKey: 'rouletteGame',
    descKey: 'rouletteGameDesc',
    cost: 5,
    color: 'from-purple-400 to-pink-500'
  },
  {
    id: 'memory',
    icon: Brain,
    nameKey: 'memoryGame',
    descKey: 'memoryGameDesc',
    cost: 3,
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'quiz',
    icon: Sparkles,
    nameKey: 'quizGame',
    descKey: 'quizGameDesc',
    cost: 4,
    color: 'from-green-400 to-emerald-500'
  }
];

export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [bonusActivities, setBonusActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("shop");
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [tasksCompletionPercent, setTasksCompletionPercent] = useState(0);
  const [upgradeModal, setUpgradeModal] = useState({ open: false, reason: 'games' });
  const { t, isRTL } = useLanguage();
  const { plan, canPlayGame } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [retryCount]);

  const loadData = async () => {
    setIsLoading(true);
    setConnectionError(false);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const selectedChildId = localStorage.getItem('selectedChildId');
      
      if (!selectedChildId) {
        const childrenData = await base44.entities.ChildProfile.filter({ family_id: currentUser.family_id });
        if (childrenData.length > 0) {
          const firstChild = childrenData[0];
          localStorage.setItem('selectedChildId', firstChild.id);
          setProfile(firstChild);
          
          const profileLanguage = firstChild.language || 'he';
          const allRewardsData = await base44.entities.Reward.filter({ 
            child_profile_id: firstChild.id, 
            family_id: currentUser.family_id 
          }, '-cost');
          
          const rewardsData = allRewardsData.filter(reward => !reward.language || reward.language === profileLanguage);
          setRewards(rewardsData);

          // Load bonus activities
          const activities = await base44.entities.BonusActivity.filter({
            child_profile_id: firstChild.id,
            family_id: currentUser.family_id,
            is_active: true,
            is_claimed: false
          });
          setBonusActivities(activities);

          // Calculate tasks completion
          await calculateTasksCompletion(firstChild.id);
        } else {
          setProfile(null);
          setRewards([]);
        }
      } else {
        const childrenData = await base44.entities.ChildProfile.filter({ 
          family_id: currentUser.family_id 
        });
        const childProfile = childrenData.find(c => c.id === selectedChildId);
        
        if (childProfile) {
          setProfile(childProfile);
          
          const profileLanguage = childProfile.language || 'he';
          const allRewardsData = await base44.entities.Reward.filter({ 
            child_profile_id: childProfile.id, 
            family_id: currentUser.family_id 
          }, '-cost');
          
          const rewardsData = allRewardsData.filter(reward => !reward.language || reward.language === profileLanguage);
          setRewards(rewardsData);

          // Load bonus activities
          const activities = await base44.entities.BonusActivity.filter({
            child_profile_id: childProfile.id,
            family_id: currentUser.family_id,
            is_active: true,
            is_claimed: false
          });
          setBonusActivities(activities);

          // Calculate tasks completion
          await calculateTasksCompletion(childProfile.id);
        } else {
          localStorage.removeItem('selectedChildId');
          setProfile(null);
          setRewards([]);
        }
      }
      
    } catch (error) {
      console.error("Error loading rewards:", error);
      setConnectionError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTasksCompletion = async (childProfileId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const profileLanguage = profile?.language || 'he';
      
      const allTasks = await base44.entities.Task.filter({ 
        child_profile_id: childProfileId,
        is_active: true
      });
      
      const tasksForLanguage = allTasks.filter(task => !task.language || task.language === profileLanguage);
      const dailyTasks = tasksForLanguage.filter(t => ['morning', 'evening'].includes(t.task_type));
      
      const completions = await base44.entities.TaskCompletion.filter({
        child_profile_id: childProfileId,
        completed_date: today
      });
      
      const completedTaskIds = completions.map(c => c.task_id);
      const completedDailyTasks = dailyTasks.filter(t => completedTaskIds.includes(t.id));
      
      const percent = dailyTasks.length > 0 ? (completedDailyTasks.length / dailyTasks.length) * 100 : 0;
      setTasksCompletionPercent(percent);
    } catch (error) {
      console.error("Error calculating tasks completion:", error);
      setTasksCompletionPercent(0);
    }
  };

  const handleClaimReward = async (reward) => {
    if (!profile || reward.is_claimed) return;

    try {
      const rewardCost = Number(reward.cost) || 0;
      const currentTokens = Number(profile.total_tokens) || 0;
      
      if (currentTokens < rewardCost) {
        alert(t('notEnoughTokens'));
        return;
      }

      await base44.entities.Reward.update(reward.id, {
        is_claimed: true,
        claimed_date: new Date().toISOString().split('T')[0]
      });

      const newTokenTotal = currentTokens - rewardCost;
      await base44.entities.ChildProfile.update(profile.id, {
        total_tokens: newTokenTotal
      });

      await loadData();
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert(t('errorClaimingReward'));
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const claimBonus = async (activity) => {
    try {
      await base44.entities.BonusActivity.update(activity.id, { is_claimed: true });
      
      const newTokens = profile.total_tokens + activity.bonus_tokens;
      await base44.entities.ChildProfile.update(profile.id, { total_tokens: newTokens });
      
      setProfile({ ...profile, total_tokens: newTokens });
      setBonusActivities(bonusActivities.filter(a => a.id !== activity.id));
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (error) {
      console.error("Error claiming bonus:", error);
    }
  };

  const playGame = async (game) => {
    if (profile.total_tokens < game.cost) {
      alert(t('notEnoughTokens'));
      return;
    }

    // Check daily limit (2 times per day for roulette and memory)
    if (game.id === 'roulette' || game.id === 'memory') {
      const today = new Date().toISOString().split('T')[0];
      const todayStart = today + 'T00:00:00.000Z';
      const todayEnd = today + 'T23:59:59.999Z';
      
      const gamesToday = await base44.entities.MiniGame.filter({
        child_profile_id: profile.id,
        game_type: game.id,
        played_at: { $gte: todayStart, $lte: todayEnd }
      });

      // Free plan: max 1 game per day total
      if (!canPlayGame(gamesToday.length)) {
        setUpgradeModal({ open: true, reason: 'games' });
        return;
      }
      
      if (gamesToday.length >= 2) {
        const gameName = game.id === 'roulette' ? t('rouletteGame') : t('memoryGame');
        alert(t('gameLimitReached', { gameName }));
        return;
      }
    }

    setSelectedGame(game);
  };

  const finishGame = async (won, prize = 0) => {
    try {
      const tokensChange = won ? (prize - selectedGame.cost) : -selectedGame.cost;
      const newTokens = profile.total_tokens + tokensChange;

      await base44.entities.ChildProfile.update(profile.id, { total_tokens: newTokens });
      
      await base44.entities.MiniGame.create({
        game_type: selectedGame.id,
        cost_tokens: selectedGame.cost,
        reward_tokens: won ? prize : 0,
        result: won ? 'win' : 'lose',
        played_at: new Date().toISOString(),
        child_profile_id: profile.id,
        family_id: profile.family_id
      });

      setProfile({ ...profile, total_tokens: newTokens });
      setGameResult({ won, prize, tokensChange });

      if (won) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      console.error("Error finishing game:", error);
    }
  };

  const closeGame = () => {
    setSelectedGame(null);
    setGameResult(null);
  };

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('connectionError')}</h2>
          <p className="text-gray-600 mb-6">{t('connectionErrorDesc')}</p>
          <Button
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
          >
            {t('retry')}
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const availableRewards = rewards.filter(r => !r.is_claimed);
  const claimedRewards = rewards.filter(r => r.is_claimed);

  return (
    <div className="max-w-6xl mx-auto p-4 pb-8 dark:bg-gray-900 dark:text-white" dir={isRTL ? 'rtl' : 'ltr'} style={{ userSelect: 'none' }}>
      {/* Mobile Back Button */}
      <div className="md:hidden mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="gap-2 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('backToDashboard')}
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('rewardsShop')}</h1>
          <p className="text-gray-600">{t('rewardsShopDesc')}</p>
        </motion.div>

        {profile && <TokenCounter count={Number(profile.total_tokens) || 0} className="max-w-sm mx-auto" />}

        {/* Tabs */}
        <div className="flex gap-2 justify-center mt-6">
          <Button
            variant={activeTab === "shop" ? "default" : "outline"}
            onClick={() => setActiveTab("shop")}
            className="rounded-2xl"
          >
            🎁 {t('rewardsShop')}
          </Button>
          <Button
            variant={activeTab === "bank" ? "default" : "outline"}
            onClick={() => setActiveTab("bank")}
            className="rounded-2xl"
          >
            <PiggyBank className="w-4 h-4 mr-1" />
            {isRTL ? 'בנק חיסכון' : 'Savings Bank'}
          </Button>
        </div>
      </div>

      {/* Savings Bank Tab */}
      {activeTab === "bank" && profile && (
        <SavingsBank profile={profile} onTokensUpdated={loadData} />
      )}

      {activeTab !== "bank" && (
      <>

      {/* Bonus Activities */}
      {bonusActivities.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Gift className="w-6 h-6" />
                {t('secretBonusActivities')}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bonusActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="relative"
                  >
                    <Card className="p-6 bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-yellow-400">
                      <div className="text-4xl mb-2">{activity.icon || '🎁'}</div>
                      <h3 className="text-xl font-bold mb-2">{activity.title}</h3>
                      <p className="text-gray-700 mb-4">{activity.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-orange-600">
                          +{activity.bonus_tokens} 🪙
                        </div>
                        <Button
                          onClick={() => claimBonus(activity)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          {t('claimBonus')} 🎉
                        </Button>
                      </div>
                    </Card>
                    <motion.div
                      className="absolute -top-2 -right-2 text-4xl"
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      ✨
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

      {/* Games Section - Only if 50% tasks completed */}
      {tasksCompletionPercent >= 50 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Dices className="w-6 h-6" />
              {t('miniGames')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {GAMES.map((game) => {
                const Icon = game.icon;
                const canPlay = profile?.total_tokens >= game.cost;
                
                return (
                  <motion.div
                    key={game.id}
                    whileHover={{ scale: canPlay ? 1.05 : 1 }}
                    whileTap={{ scale: canPlay ? 0.95 : 1 }}
                  >
                    <Card className={`p-6 cursor-pointer ${!canPlay ? 'opacity-50' : ''}`}>
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 mx-auto`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-center mb-2">
                        {game.id === 'roulette' ? t('rouletteGame') : game.id === 'memory' ? t('memoryGame') : t('quizGame')}
                      </h3>
                      <p className="text-gray-600 text-center mb-4 text-sm">
                        {game.id === 'roulette' ? t('rouletteGameDesc') : 
                         game.id === 'memory' ? t('memoryGameDesc') : 
                         t('quizGameDesc')}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold">🪙 {game.cost}</div>
                        {game.id === 'quiz' ? (
                          <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold">
                            {t('comingSoon')} 🚀
                          </div>
                        ) : (
                          <Button
                            onClick={() => playGame(game)}
                            disabled={!canPlay}
                            className={`bg-gradient-to-r ${game.color}`}
                          >
                            {t('play')}!
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
      )}

      {/* Available Rewards */}
      {availableRewards.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {t('availableGifts')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RewardCard
                  reward={reward}
                  canAfford={(Number(profile?.total_tokens) || 0) >= (Number(reward.cost) || 0)}
                  onClaim={handleClaimReward}
                  userTokens={Number(profile?.total_tokens) || 0}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Claimed Rewards */}
      {claimedRewards.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {t('myGifts')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {claimedRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RewardCard
                  reward={reward}
                  canAfford={true}
                  onClaim={() => {}}
                  userTokens={Number(profile?.total_tokens) || 0}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* No Rewards Message */}
      {rewards.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{t('noRewardsYet')}</h3>
          <p className="text-gray-600">{t('noRewardsDesc')}</p>
        </motion.div>
      )}

      {/* Motivation Message */}
      {availableRewards.length > 0 && profile && (Number(profile.total_tokens) || 0) < Math.min(...availableRewards.map(r => Number(r.cost) || 0)) && (
        <motion.div
          className="bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl p-6 text-center text-white mt-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Gift className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">{t('almostThere')}</h3>
          <p className="text-blue-100">{t('almostThereDesc')}</p>
        </motion.div>
      )}

      {/* Game Modals */}
      <AnimatePresence>
        {selectedGame && !gameResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeGame}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedGame.id === 'roulette' && (
                <RouletteWheel onFinish={finishGame} age={profile?.age || 7} />
              )}
              
              {selectedGame.id === 'memory' && (
                <MemoryGame onFinish={finishGame} age={profile?.age || 7} />
              )}
              
              <Button
                onClick={closeGame}
                variant="outline"
                className="w-full mt-4"
              >
                {t('close')}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {gameResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-white rounded-3xl p-8 text-center max-w-md"
            >
              <div className="text-6xl mb-4">
                {gameResult.won ? '🎉' : '😢'}
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {gameResult.won ? t('youWon') : t('almostThere')}
              </h2>
              {gameResult.won ? (
                <p className="text-xl mb-6">
                  {t('wonPrize', { prize: gameResult.prize })}
                  <br />
                  ({gameResult.tokensChange > 0 ? '+' : ''}{gameResult.tokensChange} {t('net')})
                </p>
              ) : (
                <p className="text-xl mb-6">
                  {t('lostTokens', { cost: selectedGame.cost })}
                  <br />
                  {t('tryAgain')}
                </p>
              )}
              <Button
                onClick={closeGame}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {t('close')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}

      <UpgradeModal
        isOpen={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false, reason: 'games' })}
        reason={upgradeModal.reason}
      />
    </div>
  );
}