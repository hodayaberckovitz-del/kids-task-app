import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';

export default function UpgradeModal({ isOpen, onClose, reason }) {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const texts = {
    he: {
      title: 'שדרג לפרימיום 👑',
      free: 'תוכנית החינם שלך',
      reasons: {
        children: 'תוכנית החינם מאפשרת ילד אחד בלבד. שדרג להוסיף ילדים נוספים!',
        tasks: 'תוכנית החינם מאפשרת עד 5 משימות. שדרג להוסיף משימות ללא הגבלה!',
        games: 'תוכנית החינם מאפשרת משחק אחד ביום. שדרג לכל המשחקים!',
      },
      upgrade: 'שדרג עכשיו',
      close: 'לא עכשיו',
    },
    en: {
      title: 'Upgrade to Premium 👑',
      reasons: {
        children: 'The free plan allows only 1 child. Upgrade to add more children!',
        tasks: 'The free plan allows up to 5 tasks. Upgrade for unlimited tasks!',
        games: 'The free plan allows 1 game per day. Upgrade for all games!',
      },
      upgrade: 'Upgrade Now',
      close: 'Not now',
    },
    ru: {
      title: 'Перейти на Premium 👑',
      reasons: {
        children: 'Бесплатный план позволяет только 1 ребёнка. Обновите для добавления детей!',
        tasks: 'Бесплатный план — до 5 задач. Обновите для неограниченного числа!',
        games: 'Бесплатный план — 1 игра в день. Обновите для всех игр!',
      },
      upgrade: 'Обновить',
      close: 'Не сейчас',
    },
    ar: {
      title: 'ترقية إلى بريميوم 👑',
      reasons: {
        children: 'الخطة المجانية تسمح بطفل واحد فقط. قم بالترقية لإضافة المزيد!',
        tasks: 'الخطة المجانية تسمح بـ 5 مهام فقط. قم بالترقية للحصول على مهام غير محدودة!',
        games: 'الخطة المجانية تسمح بلعبة واحدة يومياً. قم بالترقية لجميع الألعاب!',
      },
      upgrade: 'قم بالترقية',
      close: 'ليس الآن',
    },
  };

  const t = texts[language] || texts.he;
  const reasonText = t.reasons?.[reason] || t.reasons?.tasks;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 30 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>

            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              👑
            </motion.div>

            <h2 className="text-2xl font-black text-gray-800 mb-3">{t.title}</h2>
            <p className="text-gray-600 mb-6 text-base">{reasonText}</p>

            <div className="space-y-3">
              <Button
                onClick={() => { navigate(createPageUrl('Pricing')); onClose(); }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-lg py-6 rounded-2xl"
              >
                <Crown className="w-5 h-5 mr-2" />
                {t.upgrade}
              </Button>
              <Button variant="ghost" onClick={onClose} className="w-full">
                {t.close}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}