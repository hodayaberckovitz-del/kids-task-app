import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/LanguageContext";

// Level definitions: tokens needed to reach each level
const LEVELS = [
  { level: 1, minTokens: 0,    maxTokens: 49,    name: { he: 'טירון',  en: 'Rookie',    ru: 'Новичок',    ar: 'مبتدئ' },     emoji: '🌱', color: '#6B7280' },
  { level: 2, minTokens: 50,   maxTokens: 149,   name: { he: 'מתחיל', en: 'Beginner',  ru: 'Начинающий', ar: 'ناشئ' },      emoji: '⭐', color: '#3B82F6' },
  { level: 3, minTokens: 150,  maxTokens: 299,   name: { he: 'חרוץ',  en: 'Diligent',  ru: 'Старательный',ar: 'مجتهد' },    emoji: '💪', color: '#10B981' },
  { level: 4, minTokens: 300,  maxTokens: 499,   name: { he: 'גיבור',  en: 'Hero',     ru: 'Герой',       ar: 'بطل' },      emoji: '🦸', color: '#8B5CF6' },
  { level: 5, minTokens: 500,  maxTokens: 999,   name: { he: 'כוכב',  en: 'Star',      ru: 'Звезда',      ar: 'نجم' },      emoji: '🌟', color: '#F59E0B' },
  { level: 6, minTokens: 1000, maxTokens: 1999,  name: { he: 'אלוף',  en: 'Champion',  ru: 'Чемпион',     ar: 'بطل كبير' }, emoji: '🏆', color: '#EF4444' },
  { level: 7, minTokens: 2000, maxTokens: Infinity, name: { he: 'אגדה', en: 'Legend',  ru: 'Легенда',     ar: 'أسطورة' },   emoji: '👑', color: '#DC2626' },
];

export function getLevel(totalTokens) {
  const tokens = Number(totalTokens) || 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (tokens >= LEVELS[i].minTokens) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(totalTokens) {
  const current = getLevel(totalTokens);
  return LEVELS.find(l => l.level === current.level + 1) || null;
}

// Compact badge shown in dashboard header
export function LevelBadge({ totalTokens }) {
  const { language } = useLanguage();
  const lvl = getLevel(totalTokens);
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white font-bold text-sm shadow-lg"
      style={{ backgroundColor: lvl.color }}
    >
      <span>{lvl.emoji}</span>
      <span>{lvl.name[language] || lvl.name.en}</span>
    </motion.div>
  );
}

// Full level progress bar card
export default function LevelSystem({ totalTokens, showFull = false }) {
  const { language, isRTL } = useLanguage();
  const tokens = Number(totalTokens) || 0;
  const lvl = getLevel(tokens);
  const next = getNextLevel(tokens);

  const progress = useMemo(() => {
    if (!next) return 100;
    const range = next.minTokens - lvl.minTokens;
    const done = tokens - lvl.minTokens;
    return Math.min(100, Math.round((done / range) * 100));
  }, [tokens, lvl, next]);

  const tokensToNext = next ? next.minTokens - tokens : 0;

  if (!showFull) {
    return <LevelBadge totalTokens={tokens} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-xl border-2"
      style={{ borderColor: lvl.color + '60' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Current level */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl"
        >
          {lvl.emoji}
        </motion.div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {language === 'he' ? 'רמה' : language === 'ru' ? 'Уровень' : language === 'ar' ? 'المستوى' : 'Level'} {lvl.level}
          </div>
          <div className="text-xl font-black" style={{ color: lvl.color }}>
            {lvl.name[language] || lvl.name.en}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{tokens} 🪙</span>
          {next && <span>{next.minTokens} 🪙</span>}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: lvl.color }}
          />
        </div>
      </div>

      {next ? (
        <p className="text-xs text-gray-500 text-center">
          {tokensToNext} 🪙 →{' '}
          <span style={{ color: next.color }} className="font-bold">
            {next.emoji} {next.name[language] || next.name.en}
          </span>
        </p>
      ) : (
        <p className="text-xs font-bold text-center" style={{ color: lvl.color }}>
          {language === 'he' ? '👑 הגעת לרמה הגבוהה ביותר!' : language === 'ru' ? '👑 Максимальный уровень!' : language === 'ar' ? '👑 أعلى مستوى!' : '👑 Max Level Reached!'}
        </p>
      )}

      {/* Level milestones */}
      <div className="flex justify-between mt-4 gap-1">
        {LEVELS.map(l => (
          <div
            key={l.level}
            className={`flex-1 text-center text-xs py-1 rounded-lg transition-all ${
              l.level <= lvl.level ? 'opacity-100 font-bold' : 'opacity-30'
            }`}
          >
            <div className="text-lg">{l.emoji}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Level Up animation overlay
export function LevelUpAnimation({ newLevel, onDone, language = 'he' }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDone}
      >
        <motion.div
          className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-600 rounded-[3rem] p-10 text-center text-white shadow-2xl max-w-sm w-full mx-4 relative overflow-hidden"
          initial={{ scale: 0.3, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {/* Particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl pointer-events-none"
              style={{ left: '50%', top: '50%' }}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
                x: Math.cos((i / 12) * Math.PI * 2) * 130,
                y: Math.sin((i / 12) * Math.PI * 2) * 130,
              }}
              transition={{ duration: 1.5, delay: i * 0.07 }}
            >
              {['⭐', '🎉', '✨', '🌟'][i % 4]}
            </motion.div>
          ))}

          <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
            transition={{ duration: 0.8, repeat: 3 }}
            className="text-8xl mb-4"
          >
            {newLevel?.emoji || '🏆'}
          </motion.div>

          <div className="text-2xl font-black mb-2">
            {language === 'he' ? '🎊 עלית רמה!' : language === 'ru' ? '🎊 Новый уровень!' : language === 'ar' ? '🎊 ترقية!' : '🎊 Level Up!'}
          </div>
          <div className="text-4xl font-black mb-2">
            {newLevel?.name?.[language] || newLevel?.name?.en || ''}
          </div>
          <div className="text-sm opacity-80 mt-4">
            {language === 'he' ? 'לחץ להמשך' : language === 'ru' ? 'Нажмите, чтобы продолжить' : language === 'ar' ? 'انقر للمتابعة' : 'Tap to continue'}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}