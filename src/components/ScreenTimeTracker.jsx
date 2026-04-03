import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { base44 } from '@/api/base44Client';

// Tracks screen time and shows overlay when limit reached
export default function ScreenTimeTracker({ profile }) {
  const { isRTL, language } = useLanguage();
  const [timeUsed, setTimeUsed] = useState(0); // minutes
  const [showOverlay, setShowOverlay] = useState(false);
  const intervalRef = useRef(null);
  const startRef = useRef(Date.now());

  const limit = profile?.daily_screen_time_minutes || 0;

  useEffect(() => {
    if (!profile || limit === 0) return;

    // Load today's used time from localStorage
    const today = new Date().toISOString().split('T')[0];
    const key = `screen_time_${profile.id}_${today}`;
    const saved = parseInt(localStorage.getItem(key) || '0', 10);
    setTimeUsed(saved);

    if (saved >= limit) {
      setShowOverlay(true);
      return;
    }

    startRef.current = Date.now();

    // Tick every 30 seconds
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 60000; // minutes
      const total = saved + elapsed;
      const rounded = Math.floor(total);
      setTimeUsed(rounded);
      localStorage.setItem(key, String(Math.floor(total * 10) / 10));

      if (total >= limit) {
        setShowOverlay(true);
        clearInterval(intervalRef.current);
      }
    }, 30000);

    return () => clearInterval(intervalRef.current);
  }, [profile?.id, limit]);

  if (!profile || limit === 0 || !showOverlay) {
    return null;
  }

  const texts = {
    he: { title: 'הזמן נגמר!', sub: 'צא לשחק בחוץ! 🌳', msg: 'הגעת למגבלת זמן המסך להיום', btn: 'ביקש מההורה' },
    en: { title: 'Time\'s Up!', sub: 'Go play outside! 🌳', msg: 'You\'ve reached your screen time limit for today', btn: 'Ask Parent' },
    ru: { title: 'Время вышло!', sub: 'Иди играй на улице! 🌳', msg: 'Вы достигли лимита экранного времени на сегодня', btn: 'Спросить родителя' },
    ar: { title: 'انتهى الوقت!', sub: 'اذهب للعب في الخارج! 🌳', msg: 'لقد وصلت إلى حد وقت الشاشة لهذا اليوم', btn: 'اسأل الوالد' },
  };
  const tx = texts[language] || texts.he;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[9999] bg-gradient-to-br from-green-400 via-blue-400 to-cyan-500 flex flex-col items-center justify-center p-8"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-9xl mb-6"
        >
          🌳
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          ☀️
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-black text-white mb-4 text-center drop-shadow-lg"
        >
          {tx.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl text-white font-bold mb-3 text-center"
        >
          {tx.sub}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xl text-white/90 text-center mb-10"
        >
          {tx.msg}
        </motion.p>

        {/* Kids icons */}
        <div className="flex gap-4 mb-10">
          {['🚴', '⚽', '🎨', '📚', '🎭'].map((e, i) => (
            <motion.div
              key={i}
              className="text-5xl"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
            >
              {e}
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => {
            // Parent override — clear for 30 minutes
            const today = new Date().toISOString().split('T')[0];
            const key = `screen_time_${profile.id}_${today}`;
            const override = parseInt(localStorage.getItem(key) || '0', 10) - 30;
            localStorage.setItem(key, String(Math.max(0, override)));
            setShowOverlay(false);
          }}
          className="bg-white/20 hover:bg-white/30 text-white font-bold text-lg px-8 py-4 rounded-full border-2 border-white/50 transition-all"
        >
          🔑 {tx.btn}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}