import React, { useState } from "react";
import { motion } from "framer-motion";
import Icon from "./shared/Icon";
import { Check, Edit3, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function TaskCard({ task, isCompleted, onComplete, streak, displayMode, className = "" }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLanguage();
  
  const isInputTask = task.input_type === 'text';
  const isVisualMode = displayMode === 'visual_large';

  const handleClick = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Add haptic feedback on mobile
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([50, 30, 50]);
    }
    
    await onComplete(task, isCompleted);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  };

  const baseTokens = Number(task.base_tokens) || 1;
  const currentStreak = Number(streak) || 0;
  const streakBonus = Math.floor(currentStreak / 7);
  const totalTokens = baseTokens + streakBonus;

  if (isVisualMode) {
    // Visual Mode - Large image with minimal text
    return (
      <motion.div
        className={`relative p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-lg cursor-pointer select-none ${className}`}
        style={{ backgroundColor: task.color + "20", borderColor: task.color + "40" }}
        whileHover={{ scale: isCompleted ? 1 : 1.05, y: isCompleted ? 0 : -5 }}
        whileTap={{ scale: isCompleted ? 1 : 0.95 }}
        onClick={handleClick}
        animate={isAnimating && !isInputTask ? { 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{ duration: 0.6 }}
      >
        {isCompleted && (
          <motion.div 
            className="absolute inset-0 bg-green-500/20 rounded-3xl flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>
        )}
        
        <div className={`text-center ${isCompleted ? 'opacity-50' : ''}`}>
          {/* Large Visual Image or Icon */}
          {task.visual_image_url ? (
            <motion.div 
              className="w-full h-32 md:h-40 mb-3 md:mb-4 rounded-xl md:rounded-2xl overflow-hidden"
              animate={isAnimating && !isInputTask ? { rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.6 }}
            >
              <img 
                src={task.visual_image_url} 
                alt={task.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : (
            <motion.div 
              className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-3 md:mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: task.color }}
              animate={isAnimating && !isInputTask ? { rotate: [0, 360] } : {}}
              transition={{ duration: 0.6 }}
            >
              <Icon name={task.icon} className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </motion.div>
          )}
          
          <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">{task.title}</h3>
          
          {!isCompleted && (
            <div className="text-lg text-gray-600 font-bold">
              <div className="mb-1">🪙 {totalTokens}</div>
              {streakBonus > 0 && (
                <div className="text-sm text-orange-600">
                  🔥 +{streakBonus}!
                </div>
              )}
              {isInputTask && (
                <div className="flex items-center justify-center gap-1 text-sm text-blue-600 mt-2">
                  <Edit3 className="w-4 h-4"/>
                  <span>{t('openTask')}</span>
                </div>
              )}
            </div>
          )}
          
          {isCompleted && (
            <motion.div 
              className="text-lg text-green-600 font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ✅ {t('completed')}!
            </motion.div>
          )}
        </div>
        
        {isAnimating && !isInputTask && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos(i * 60 * Math.PI / 180) * 60,
                  y: Math.sin(i * 60 * Math.PI / 180) * 60,
                }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Standard Text Mode
  return (
    <motion.div
      className={`relative p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg cursor-pointer select-none dark:bg-gray-800/80 dark:border-gray-700 ${className}`}
      style={{ backgroundColor: task.color + "20", borderColor: task.color + "40" }}
      whileHover={{ scale: isCompleted ? 1 : 1.05, y: isCompleted ? 0 : -5 }}
      whileTap={{ scale: isCompleted ? 1 : 0.95 }}
      onClick={handleClick}
      animate={isAnimating && !isInputTask ? { 
        scale: [1, 1.15, 1.05, 1],
        rotate: [0, -3, 3, 0],
        backgroundColor: ['#ffffff20', '#10b98140', '#10b98160', '#10b98140', '#ffffff20']
      } : {}}
      transition={{ duration: 0.8 }}
    >
      {isCompleted && (
        <motion.div 
          className="absolute inset-0 bg-green-500/20 rounded-3xl flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 10,
              delay: 0.1 
            }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-2xl"
          >
            <Check className="w-10 h-10 text-white stroke-[3]" />
          </motion.div>
        </motion.div>
      )}
      
      <div className={`text-center ${isCompleted ? 'opacity-50' : ''}`}>
        <motion.div 
          className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: task.color }}
          animate={isAnimating && !isInputTask ? { 
            rotate: [0, 360, 720],
            scale: [1, 1.3, 0.9, 1]
          } : {}}
          transition={{ duration: 0.8 }}
        >
          <Icon name={task.icon} className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </motion.div>
        
        <h3 className="text-base md:text-lg font-bold text-gray-800 dark:text-white mb-2">{task.title}</h3>
        
        {!isCompleted && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <div className="font-medium">🪙 {totalTokens} {t('tokens')}</div>
            {streakBonus > 0 && (
              <div className="text-xs text-orange-600 mt-1">
                🔥 {t('streakBonus')} +{streakBonus}!
              </div>
            )}
            {isInputTask && (
              <div className="flex items-center justify-center gap-1 text-xs text-blue-600 mt-1">
                <Edit3 className="w-3 h-3"/>
                <span>{t('openTask')}</span>
              </div>
            )}
          </div>
        )}
        
        {isCompleted && (
          <motion.div 
            className="text-sm text-green-600 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✅ {t('completed')}!
          </motion.div>
        )}
      </div>
      
      {isAnimating && !isInputTask && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Sparkles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
                x: Math.cos(i * 30 * Math.PI / 180) * 80,
                y: Math.sin(i * 30 * Math.PI / 180) * 80,
              }}
              transition={{ duration: 1, delay: i * 0.05 }}
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </motion.div>
          ))}
          
          {/* Confetti circles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`confetti-${i}`}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                backgroundColor: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6'][i % 4]
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos(i * 45 * Math.PI / 180) * 70,
                y: Math.sin(i * 45 * Math.PI / 180) * 70,
              }}
              transition={{ duration: 1, delay: i * 0.08 }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}