import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Check, Edit3 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function StarTaskCard({ task, isCompleted, onComplete, displayMode, className = "" }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLanguage();

  const handleComplete = async () => {
    if (isAnimating || isCompleted) return;
    
    setIsAnimating(true);
    
    // Add haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([70, 40, 70, 40, 70]);
    }
    
    const starTokens = Number(task.star_tokens) || 15;
    
    // For all star tasks - pass task, tokens, and completion status
    await onComplete(task, false, null);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  const isInputTask = task.input_type === 'text';
  const starTokens = Number(task.star_tokens) || 15;
  const isVisualMode = displayMode === 'visual_large';

  if (isVisualMode) {
    // Visual Mode - Large image
    return (
      <motion.div
        className={`relative p-4 rounded-2xl shadow-lg cursor-pointer select-none border-2 bg-gradient-to-br from-yellow-100 to-orange-100 ${className}`}
        style={{ borderColor: isCompleted ? "#10B981" : "#F59E0B" }}
        whileHover={{ scale: isCompleted ? 1 : 1.05 }}
        whileTap={{ scale: isCompleted ? 1 : 0.95 }}
        onClick={handleComplete}
        animate={isAnimating && !isInputTask ? { 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
      >
        {isCompleted && (
          <motion.div 
            className="absolute inset-0 bg-green-500/20 rounded-2xl flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>
        )}

        <div className={`text-center ${isCompleted ? 'opacity-50' : ''}`}>
          {task.visual_image_url ? (
            <motion.div 
              className="w-full h-36 mb-3 rounded-xl overflow-hidden"
              animate={isAnimating ? { rotate: [0, 5, -5, 0] } : {}}
            >
              <img 
                src={task.visual_image_url} 
                alt={task.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : (
            <motion.div 
              className="w-28 h-28 mx-auto mb-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center"
              animate={isAnimating ? { rotate: [0, 360] } : {}}
            >
              <Star className="w-14 h-14 text-white fill-current" />
            </motion.div>
          )}
          
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{task.title}</h3>
          
          {!isCompleted && (
            <div className="text-lg">
              <div className="font-bold text-orange-600">
                ⭐ {starTokens}
              </div>
              <div className="text-orange-500 mt-1">{t('starTask')}</div>
               {isInputTask && (
                <div className="flex items-center justify-center gap-1 text-sm text-blue-600 mt-1">
                  <Edit3 className="w-3 h-3"/>
                  <span>{t('openTask')}</span>
                </div>
              )}
            </div>
          )}
          
          {isCompleted && (
            <div className="text-lg text-green-600 font-medium">
              ⭐ {t('completed')}!
            </div>
          )}
        </div>

        {isAnimating && !isInputTask && (
          <motion.div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-400"
                style={{ left: '50%', top: '50%' }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                  x: Math.cos(i * 45 * Math.PI / 180) * 50,
                  y: Math.sin(i * 45 * Math.PI / 180) * 50,
                }}
                transition={{ duration: 1.2, delay: i * 0.1 }}
              >
                ⭐
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Standard Text Mode
  return (
    <motion.div
      className={`relative p-4 rounded-2xl shadow-lg cursor-pointer select-none border-2 bg-gradient-to-br from-yellow-100 to-orange-100 ${className}`}
      style={{ borderColor: isCompleted ? "#10B981" : "#F59E0B" }}
      whileHover={{ scale: isCompleted ? 1 : 1.05 }}
      whileTap={{ scale: isCompleted ? 1 : 0.95 }}
      onClick={isCompleted ? undefined : handleComplete}
      animate={isAnimating && !isInputTask ? { 
        scale: [1, 1.2, 1.1, 1],
        rotate: [0, -5, 5, -3, 3, 0],
        boxShadow: [
          '0 10px 30px rgba(245, 158, 11, 0.3)',
          '0 20px 60px rgba(245, 158, 11, 0.6)',
          '0 10px 30px rgba(245, 158, 11, 0.3)'
        ]
      } : {}}
      transition={{ duration: 1 }}
    >
      {isCompleted && (
        <motion.div 
          className="absolute inset-0 bg-green-500/20 rounded-2xl flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 10
            }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl"
          >
            <Check className="w-8 h-8 text-white stroke-[3]" />
          </motion.div>
        </motion.div>
      )}

      <div className={`text-center ${isCompleted ? 'opacity-50' : ''}`}>
        <motion.div 
          className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center"
          animate={isAnimating ? { 
            rotate: [0, 360, 720],
            scale: [1, 1.5, 1]
          } : {}}
          transition={{ duration: 1 }}
        >
          <Star className="w-8 h-8 text-white fill-current" />
        </motion.div>
        
        <h3 className="text-sm font-bold text-gray-800 mb-2">{task.title}</h3>
        
        {!isCompleted && (
          <div className="text-xs">
            <div className="font-bold text-orange-600">
              ⭐ {starTokens} {t('tokens')}
            </div>
            <div className="text-orange-500 mt-1">{t('starTask')}</div>
             {isInputTask && (
              <div className="flex items-center justify-center gap-1 text-xs text-blue-600 mt-1">
                <Edit3 className="w-3 h-3"/>
                <span>{t('openTask')}</span>
              </div>
            )}
          </div>
        )}
        
        {isCompleted && (
          <div className="text-xs text-green-600 font-medium">
            ⭐ {t('completed')}!
          </div>
        )}
      </div>

      {isAnimating && !isInputTask && (
        <motion.div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large star burst */}
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute"
              style={{ left: '50%', top: '50%' }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
                x: Math.cos(i * 22.5 * Math.PI / 180) * 80,
                y: Math.sin(i * 22.5 * Math.PI / 180) * 80,
                rotate: [0, 180 + i * 20]
              }}
              transition={{ duration: 1.5, delay: i * 0.04 }}
            >
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
            </motion.div>
          ))}
          
          {/* Sparkles */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute text-2xl"
              style={{ left: '50%', top: '50%' }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
                x: Math.cos(i * 36 * Math.PI / 180) * 60,
                y: Math.sin(i * 36 * Math.PI / 180) * 60,
              }}
              transition={{ duration: 1.2, delay: i * 0.1 }}
            >
              ✨
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}