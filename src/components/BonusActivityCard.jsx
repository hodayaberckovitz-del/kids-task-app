import React from "react";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageContext";

export default function BonusActivityCard({ activity, onClaim }) {
  const { t } = useLanguage();

  // Map unlock conditions to translation keys
  const getTitleByCondition = (condition) => {
    const map = {
      'streak_3': 'bonus3DaysTitle',
      'streak_7': 'bonus7DaysTitle',
      'streak_30': 'bonus30DaysTitle',
      'tasks_10': 'bonus10TasksTitle'
    };
    return map[condition] ? t(map[condition]) : activity.title;
  };

  const getDescriptionByCondition = (condition) => {
    const map = {
      'streak_3': 'bonus3DaysDesc',
      'streak_7': 'bonus7DaysDesc',
      'streak_30': 'bonus30DaysDesc',
      'tasks_10': 'bonus10TasksDesc'
    };
    return map[condition] ? t(map[condition]) : activity.description;
  };

  // Fallback: detect Hebrew text and translate
  const detectAndTranslate = (title, description) => {
    // Check if contains Hebrew patterns
    if (title.includes('רצף 3 ימים') || title.includes('3 ימים')) {
      return { title: t('bonus3DaysTitle'), description: t('bonus3DaysDesc') };
    }
    if (title.includes('שבוע מושלם') || title.includes('שבוע')) {
      return { title: t('bonus7DaysTitle'), description: t('bonus7DaysDesc') };
    }
    if (title.includes('חודש שלם') || title.includes('חודש')) {
      return { title: t('bonus30DaysTitle'), description: t('bonus30DaysDesc') };
    }
    if (title.includes('10 משימות') || title.includes('משימות ביום')) {
      return { title: t('bonus10TasksTitle'), description: t('bonus10TasksDesc') };
    }
    
    return { title, description };
  };

  let displayTitle = getTitleByCondition(activity.unlock_condition);
  let displayDescription = getDescriptionByCondition(activity.unlock_condition);
  
  // If still showing original text, try to detect and translate Hebrew
  if (displayTitle === activity.title || displayDescription === activity.description) {
    const translated = detectAndTranslate(activity.title, activity.description);
    displayTitle = translated.title;
    displayDescription = translated.description;
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.05 }}
      className="relative bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-6 border-4 border-yellow-400 shadow-xl"
    >
      {/* Sparkle effect */}
      <motion.div
        className="absolute -top-2 -right-2 text-3xl"
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        ✨
      </motion.div>

      <div className="text-center">
        <div className="text-5xl mb-3">{activity.icon || '🎁'}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{displayTitle}</h3>
        <p className="text-gray-700 mb-4 text-sm">{displayDescription}</p>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-orange-600">
            +{activity.bonus_tokens} 🪙
          </div>
          <Button
            onClick={() => onClaim(activity)}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            {t('claimBonus')} 🎉
          </Button>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-2 left-2 text-xl">🌟</div>
      <div className="absolute bottom-2 right-2 text-xl">💫</div>
    </motion.div>
  );
}