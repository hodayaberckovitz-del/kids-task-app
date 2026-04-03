import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/LanguageContext";
import { format } from "date-fns";
import ShareAchievementButton from "./ShareAchievementButton";

// Badge definitions - auto-unlock logic
export const BADGE_DEFS = {
  morning_king: {
    icon: '👑',
    title: { he: 'מלך הבוקר', en: 'Morning King', ru: 'Король утра', ar: 'ملك الصباح' },
    desc: { he: '7 ימים רצופים של משימות בוקר', en: '7 days morning streak', ru: '7 дней утренних заданий', ar: '7 أيام متتالية صباحاً' }
  },
  consistent: {
    icon: '🔥',
    title: { he: 'מתמיד', en: 'Consistent', ru: 'Постоянный', ar: 'مثابر' },
    desc: { he: 'רצף של 14 ימים', en: '14 day streak', ru: '14 дней подряд', ar: 'سلسلة 14 يوماً' }
  },
  pro_saver: {
    icon: '🐷',
    title: { he: 'חוסך מקצועי', en: 'Pro Saver', ru: 'Профи-копилка', ar: 'مدخر محترف' },
    desc: { he: '500 אסימונים בחיסכון', en: '500 tokens saved', ru: '500 жетонов в копилке', ar: '500 رمز مدخر' }
  }
};

// Check and unlock badges for a profile
export async function checkAndUnlockBadges(profile, completedToday = []) {
  if (!profile?.id || !profile?.family_id) return;
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingBadges = await base44.entities.Badge.filter({
      child_profile_id: profile.id,
      family_id: profile.family_id
    });
    const existingTypes = existingBadges.map(b => b.badge_type);

    const toCreate = [];

    // Morning King: 7+ day streak
    if (!existingTypes.includes('morning_king') && (profile.current_streak || 0) >= 7) {
      toCreate.push({
        child_profile_id: profile.id,
        family_id: profile.family_id,
        badge_type: 'morning_king',
        title: BADGE_DEFS.morning_king.title.he,
        icon: BADGE_DEFS.morning_king.icon,
        unlocked_date: today
      });
    }

    // Consistent: 14+ day streak
    if (!existingTypes.includes('consistent') && (profile.current_streak || 0) >= 14) {
      toCreate.push({
        child_profile_id: profile.id,
        family_id: profile.family_id,
        badge_type: 'consistent',
        title: BADGE_DEFS.consistent.title.he,
        icon: BADGE_DEFS.consistent.icon,
        unlocked_date: today
      });
    }

    for (const badge of toCreate) {
      await base44.entities.Badge.create(badge);
    }
  } catch (e) {
    console.error('Badge check error:', e);
  }
}

export default function BadgeDisplay({ childProfileId, familyId }) {
  const [badges, setBadges] = useState([]);
  const { language } = useLanguage();

  useEffect(() => {
    if (!childProfileId || !familyId) return;
    base44.entities.Badge.filter({ child_profile_id: childProfileId, family_id: familyId })
      .then(setBadges)
      .catch(() => {});
  }, [childProfileId, familyId]);

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {badges.map((badge) => {
        const def = BADGE_DEFS[badge.badge_type];
        return (
          <motion.div
            key={badge.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.15 }}
            title={def?.desc?.[language] || badge.title}
            className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-3 py-1 text-sm font-bold cursor-default shadow"
          >
            <span>{badge.icon}</span>
            <span className="text-white">{def?.title?.[language] || badge.title}</span>
            <ShareAchievementButton
              childName=""
              achievementTitle={def?.title?.[language] || badge.title}
              achievementIcon={badge.icon}
              variant="icon"
            />
          </motion.div>
        );
      })}
    </div>
  );
}