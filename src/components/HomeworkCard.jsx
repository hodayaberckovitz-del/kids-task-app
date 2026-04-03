import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useLanguage } from "@/components/LanguageContext";

export default function HomeworkCard({ homework, subject, onComplete, displayMode, className = "" }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLanguage();

  const handleComplete = async () => {
    if (homework.is_completed || isAnimating) return;
    
    setIsAnimating(true);
    
    // Add haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([60, 30, 60]);
    }
    
    const tokens = 8; // Fixed tokens for homework
    await onComplete(homework, tokens);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 1200); // Changed timeout duration
  };

  const isOverdue = new Date(homework.due_date) < new Date() && !homework.is_completed;
  const isVisualMode = displayMode === 'visual_large';

  if (isVisualMode) {
    // Visual Mode - Large display
    return (
      <motion.div
        className={`relative p-6 rounded-3xl shadow-lg cursor-pointer select-none border-2 ${className}`}
        style={{ 
          backgroundColor: subject?.color + "15",
          borderColor: homework.is_completed ? "#10B981" : (isOverdue ? "#EF4444" : subject?.color + "40")
        }}
        whileHover={{ scale: homework.is_completed ? 1 : 1.02 }}
        whileTap={{ scale: homework.is_completed ? 1 : 0.98 }}
        onClick={handleComplete}
        animate={isAnimating ? { 
          scale: [1, 1.1, 1],
          rotate: [0, 2, -2, 0]
        } : {}}
      >
        {homework.is_completed && (
          <motion.div 
            className="absolute inset-0 bg-green-500/20 rounded-3xl flex items-center justify-center"
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

        <div className={`text-center ${homework.is_completed ? 'opacity-50' : ''}`}>
          {/* Large Icon */}
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: subject?.color }}
          >
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          
          {/* Subject Name */}
          <div className="text-sm font-medium mb-2" style={{ color: subject?.color }}>
            {subject?.name}
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-800 mb-3 text-xl">
            {homework.title}
          </h3>

          {/* Due Date and Tokens */}
          <div className="flex items-center justify-center gap-4 text-base text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(homework.due_date), 'dd/MM', { locale: he })}</span>
            </div>
            
            {!homework.is_completed && (
              <div className="flex items-center gap-1 text-orange-600 font-bold">
                <span>🪙</span>
                <span>8</span>
              </div>
            )}
          </div>
          
          {isOverdue && !homework.is_completed && (
            <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium inline-block">
              {t('overdue')}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Standard Text Mode (original)
  return (
    <motion.div
      className={`relative p-4 rounded-2xl shadow-md cursor-pointer select-none border-2 dark:bg-gray-800/80 dark:border-gray-700 ${className}`}
      style={{ 
        backgroundColor: subject?.color + "15",
        borderColor: homework.is_completed ? "#10B981" : (isOverdue ? "#EF4444" : subject?.color + "40")
      }}
      whileHover={{ scale: homework.is_completed ? 1 : 1.02 }}
      whileTap={{ scale: homework.is_completed ? 1 : 0.98 }}
      onClick={handleComplete}
      animate={isAnimating ? { 
        scale: [1, 1.12, 1.05, 1],
        rotate: [0, 2, -2, 0],
        borderColor: ['#10B981', '#34D399', '#10B981'],
        backgroundColor: [subject?.color + "15", '#10B98130', subject?.color + "15"]
      } : {}}
      transition={{ duration: 0.8 }}
    >
      {/* Completion Overlay */}
      {homework.is_completed && (
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
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-xl"
          >
            <Check className="w-7 h-7 text-white stroke-[3]" />
          </motion.div>
        </motion.div>
      )}

      {/* Success animation */}
      {isAnimating && (
        <motion.div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-green-400"
              style={{ left: '50%', top: '50%' }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos(i * 45 * Math.PI / 180) * 60,
                y: Math.sin(i * 45 * Math.PI / 180) * 60,
              }}
              transition={{ duration: 1, delay: i * 0.08 }}
            />
          ))}
        </motion.div>
      )}

      <div className={`${homework.is_completed ? 'opacity-50' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: subject?.color }}
            >
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-sm" style={{ color: subject?.color }}>
              {subject?.name}
            </span>
          </div>
          
          {isOverdue && !homework.is_completed && (
            <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
              {t('overdue')}
            </div>
          )}
        </div>

        {/* Content */}
        <h3 className="font-bold text-gray-800 dark:text-white mb-2 text-sm leading-relaxed">
          {homework.title}
        </h3>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {t('dueDate')}: {format(new Date(homework.due_date), 'dd/MM', { locale: he })}
            </span>
          </div>
          
          {!homework.is_completed && (
            <div className="flex items-center gap-1 text-orange-600 font-medium">
              <span>🪙</span>
              <span>8</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}