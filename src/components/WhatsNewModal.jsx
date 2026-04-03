import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageContext";

const LATEST_VERSION = "1.4.0"; // Update this when adding new updates

const updates = {
  he: [
    {
      version: "1.4.0",
      date: "20.02.2026",
      title: "🚀 גרסה ראשונה לפרסום!",
      items: [
        "📊 מעקב Analytics על הישגים וביצועים",
        "🌐 תמיכה מלאה ב-4 שפות: עברית, אנגלית, רוסית וערבית",
        "📴 גלישה חלקה גם ללא חיבור אינטרנט",
        "💬 WhatsApp סוכן חכם לתזכורות ועדכונים",
        "🎨 שיפורים בעיצוב ובחוויית השימוש"
      ]
    },
    {
      version: "1.3.0",
      date: "01.01.2026",
      title: "🎮 משחקים ובונוסים!",
      items: [
        "🎮 מרכז משחקים חדש - גלגל המזל ועוד",
        "🎁 בונוסים סודיים עבור רצפים והישגים",
        "📧 תזכורות אוטומטיות במייל (בוקר וערב)",
        "🤖 הסוכן ב-WhatsApp יכול ליצור משימות חדשות",
        "✨ השלמת משימה מתוזמנת מוסיפה אסימונים"
      ]
    },
    {
      version: "1.2.0",
      date: "23.12.2025",
      title: "🎉 עדכונים חדשים!",
      items: [
        "✨ סוכן WhatsApp חדש לתזכורות משימות",
        "🌟 אפשרות לראות מה התחדש באפליקציה",
        "🎯 שיפורים בממשק המשתמש",
        "🐛 תיקוני באגים ושיפורי ביצועים"
      ]
    }
  ],
  en: [
    {
      version: "1.4.0",
      date: "20.02.2026",
      title: "🚀 First Public Release!",
      items: [
        "📊 Analytics tracking for achievements and performance",
        "🌐 Full support for 4 languages: Hebrew, English, Russian & Arabic",
        "📴 Smooth experience even without internet connection",
        "💬 Smart WhatsApp agent for reminders and updates",
        "🎨 Design and UX improvements"
      ]
    },
    {
      version: "1.3.0",
      date: "01.01.2026",
      title: "🎮 Games & Bonuses!",
      items: [
        "🎮 New games center - roulette wheel and more",
        "🎁 Secret bonuses for streaks and achievements",
        "📧 Automatic email reminders (morning & evening)",
        "🤖 WhatsApp agent can create new tasks",
        "✨ Completing timed tasks adds tokens"
      ]
    },
    {
      version: "1.2.0",
      date: "23.12.2025",
      title: "🎉 New Updates!",
      items: [
        "✨ New WhatsApp agent for task reminders",
        "🌟 Option to see what's new in the app",
        "🎯 User interface improvements",
        "🐛 Bug fixes and performance improvements"
      ]
    }
  ],
  ru: [
    {
      version: "1.4.0",
      date: "20.02.2026",
      title: "🚀 Первый публичный релиз!",
      items: [
        "📊 Аналитика достижений и результатов",
        "🌐 Полная поддержка 4 языков: иврит, английский, русский и арабский",
        "📴 Плавная работа даже без интернета",
        "💬 Умный WhatsApp агент для напоминаний",
        "🎨 Улучшения дизайна и UX"
      ]
    },
    {
      version: "1.3.0",
      date: "01.01.2026",
      title: "🎮 Игры и бонусы!",
      items: [
        "🎮 Новый игровой центр - колесо фортуны и другое",
        "🎁 Секретные бонусы за серии и достижения",
        "📧 Автоматические напоминания по email (утро и вечер)",
        "🤖 WhatsApp агент может создавать новые задачи",
        "✨ Выполнение задач с таймером добавляет жетоны"
      ]
    },
    {
      version: "1.2.0",
      date: "23.12.2025",
      title: "🎉 Новые обновления!",
      items: [
        "✨ Новый WhatsApp агент для напоминаний о задачах",
        "🌟 Возможность увидеть что нового в приложении",
        "🎯 Улучшения интерфейса",
        "🐛 Исправления ошибок и улучшения производительности"
      ]
    }
  ],
  ar: [
    {
      version: "1.4.0",
      date: "20.02.2026",
      title: "🚀 الإصدار العام الأول!",
      items: [
        "📊 تتبع الإنجازات والأداء",
        "🌐 دعم كامل لـ 4 لغات: العبرية والإنجليزية والروسية والعربية",
        "📴 تجربة سلسة حتى بدون إنترنت",
        "💬 وكيل WhatsApp ذكي للتذكيرات والتحديثات",
        "🎨 تحسينات التصميم وتجربة المستخدم"
      ]
    },
    {
      version: "1.3.0",
      date: "01.01.2026",
      title: "🎮 ألعاب ومكافآت!",
      items: [
        "🎮 مركز ألعاب جديد - عجلة الحظ والمزيد",
        "🎁 مكافآت سرية للسلاسل والإنجازات",
        "📧 تذكيرات تلقائية عبر البريد الإلكتروني (صباحاً ومساءً)",
        "🤖 وكيل WhatsApp يمكنه إنشاء مهام جديدة",
        "✨ إكمال المهام الموقوتة يضيف رموزاً"
      ]
    },
    {
      version: "1.2.0",
      date: "23.12.2025",
      title: "🎉 تحديثات جديدة!",
      items: [
        "✨ وكيل WhatsApp جديد لتذكيرات المهام",
        "🌟 خيار لرؤية ما الجديد في التطبيق",
        "🎯 تحسينات واجهة المستخدم",
        "🐛 إصلاح الأخطاء وتحسينات الأداء"
      ]
    }
  ]
};

export default function WhatsNewModal({ isOpen, onClose }) {
  const { language, isRTL } = useLanguage();
  const currentUpdates = updates[language] || updates['he'];

  const handleClose = () => {
    localStorage.setItem('lastSeenVersion', LATEST_VERSION);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </motion.div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {isRTL ? 'מה חדש' : 'What\'s New'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {currentUpdates.map((update, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-purple-900">{update.title}</h4>
                    <span className="text-xs text-gray-500">{update.date}</span>
                  </div>
                  <ul className="space-y-2">
                    {update.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-gray-700 text-sm">
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={handleClose}
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isRTL ? 'סגור' : 'Close'}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { LATEST_VERSION };