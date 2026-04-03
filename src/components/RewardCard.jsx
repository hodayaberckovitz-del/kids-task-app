
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageContext";

export default function RewardCard({ reward, onClaim, userTokens, className = "" }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLanguage();

  // Ensure all token values are valid numbers
  const rewardCost = Number(reward.cost) || Number(reward.token_cost) || 0;
  const tokensAvailable = Number(userTokens) || 0;
  const canAfford = tokensAvailable >= rewardCost;

  const handleClaim = async () => {
    if (!canAfford || reward.is_claimed || isAnimating) return;
    
    setIsAnimating(true);
    await onClaim(reward);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <motion.div
      className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden ${className}`}
      whileHover={{ scale: canAfford && !reward.is_claimed ? 1.02 : 1 }}
      animate={isAnimating ? {
        scale: [1, 1.1, 1],
        rotate: [0, 2, -2, 0]
      } : {}}
    >
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-purple-100 to-pink-100">
        {reward.image_url ? (
          <img 
            src={reward.image_url} 
            alt={reward.title || reward.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gift className="w-16 h-16 text-purple-400" />
          </div>
        )}
        
        {/* Claimed Overlay */}
        {reward.is_claimed && (
          <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">🎉</div>
              <div className="font-bold">{t('claimed')}</div>
            </div>
          </div>
        )}
        
        {/* Can't Afford Overlay */}
        {!canAfford && !reward.is_claimed && (
          <div className="absolute inset-0 bg-gray-500/50 flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{reward.title || reward.name}</h3>
        {reward.description && (
          <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="text-lg font-bold text-gray-800">{rewardCost}</span>
          </div>
          
          {!reward.is_claimed && (
            <Button
              onClick={handleClaim}
              disabled={!canAfford}
              className={`rounded-full px-6 ${
                canAfford 
                  ? "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700" 
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {canAfford ? t('claim') : t('notEnoughTokens')}
            </Button>
          )}
        </div>
      </div>
      
      {/* Celebration Effect */}
      {isAnimating && (
        <motion.div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
                x: Math.cos(i * 30 * Math.PI / 180) * 100,
                y: Math.sin(i * 30 * Math.PI / 180) * 100,
              }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
            >
              {['🎉', '⭐', '🎊', '✨'][i % 4]}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
