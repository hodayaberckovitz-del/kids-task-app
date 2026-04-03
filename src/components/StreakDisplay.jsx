import React from "react";
import { motion } from "framer-motion";
import { Flame, Star } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function StreakDisplay({ currentStreak, bestStreak, className = "" }) {
  const { t } = useLanguage();

  return (
    <motion.div 
      className={`bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg flex justify-around ${className}`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="text-center">
        <div className="flex justify-center items-center gap-2 mb-1">
          <Flame className="w-8 h-8 text-orange-500" />
          <div className="text-3xl font-bold text-gray-800">{currentStreak}</div>
        </div>
        <div className="text-gray-600 text-sm">{t('currentStreak')}</div>
      </div>
      <div className="border-l border-gray-200"></div>
      <div className="text-center">
        <div className="flex justify-center items-center gap-2 mb-1">
          <Star className="w-8 h-8 text-yellow-400" />
          <div className="text-3xl font-bold text-gray-800">{bestStreak}</div>
        </div>
        <div className="text-gray-600 text-sm">{t('bestStreak')}</div>
      </div>
    </motion.div>
  );
}