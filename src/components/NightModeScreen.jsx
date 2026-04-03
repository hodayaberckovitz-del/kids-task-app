import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';

const STARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 3,
  duration: Math.random() * 2 + 2,
}));

export default function NightModeScreen({ childName }) {
  const { language, isRTL } = useLanguage();

  const texts = {
    he: { title: 'לילה טוב', sub: `שינה נעימה, ${childName || 'יקירי'} 🌙`, msg: 'האפליקציה תיפתח מחדש בבוקר 🌅' },
    en: { title: 'Good Night', sub: `Sweet dreams, ${childName || 'dear'} 🌙`, msg: 'The app will open again in the morning 🌅' },
    ru: { title: 'Спокойной ночи', sub: `Сладких снов, ${childName || 'дорогой'} 🌙`, msg: 'Приложение откроется утром 🌅' },
    ar: { title: 'تصبح على خير', sub: `أحلاماً جميلة، ${childName || 'عزيزي'} 🌙`, msg: 'سيفتح التطبيق في الصباح 🌅' },
  };
  const t = texts[language] || texts.he;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-b from-indigo-950 via-blue-950 to-purple-950 flex flex-col items-center justify-center z-50 overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Stars */}
      {STARS.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: star.duration, delay: star.delay, repeat: Infinity }}
        />
      ))}

      {/* Moon */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="text-9xl mb-8"
      >
        🌙
      </motion.div>

      {/* Text */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-5xl font-black text-white mb-4 drop-shadow-lg text-center px-4"
      >
        {t.title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-2xl text-blue-200 mb-4 text-center px-4"
      >
        {t.sub}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-lg text-blue-300 text-center px-4"
      >
        {t.msg}
      </motion.p>

      {/* Floating stars decoration */}
      {['⭐', '✨', '💫'].map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl"
          style={{ left: `${20 + i * 30}%`, bottom: '15%' }}
          animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
        >
          {s}
        </motion.div>
      ))}
    </motion.div>
  );
}