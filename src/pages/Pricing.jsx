import React from "react";
import { motion } from "framer-motion";
import { Check, Crown, Star, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/LanguageContext";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const PLANS = [
  {
    id: "free",
    icon: "⭐",
    color: "from-gray-400 to-gray-500",
    border: "border-gray-300",
    badge: null,
    price: { he: "חינם", en: "Free", ru: "Бесплатно", ar: "مجاني" },
    features: {
      he: ["ילד אחד בלבד", "עד 5 משימות", "משחק אחד ביום", "לוח בקרה בסיסי"],
      en: ["1 child only", "Up to 5 tasks", "1 game per day", "Basic dashboard"],
      ru: ["1 ребенок", "До 5 задач", "1 игра в день", "Базовый дашборд"],
      ar: ["طفل واحد فقط", "حتى 5 مهام", "لعبة واحدة يومياً", "لوحة تحكم أساسية"],
    },
    notIncluded: {
      he: ["ילדים נוספים", "דוחות שבועיים", "כל המשחקים", "ערכות צבע", "חיבור WhatsApp"],
      en: ["More children", "Weekly reports", "All games", "Color themes", "WhatsApp"],
      ru: ["Больше детей", "Еженедельные отчёты", "Все игры", "Темы", "WhatsApp"],
      ar: ["أطفال إضافيون", "التقارير الأسبوعية", "جميع الألعاب", "الثيمات", "واتساب"],
    },
  },
  {
    id: "premium",
    icon: "👑",
    color: "from-purple-500 to-pink-600",
    border: "border-purple-400",
    badge: { he: "הכי פופולרי", en: "Most Popular", ru: "Популярный", ar: "الأكثر شيوعاً" },
    price: { he: "₪19.90/חודש", en: "₪19.90/mo", ru: "₪19.90/мес", ar: "₪19.90/شهر" },
    features: {
      he: ["ילדים ללא הגבלה", "משימות ללא הגבלה", "כל המשחקים", "דוחות שבועיים", "ערכות צבע", "תזכורות"],
      en: ["Unlimited children", "Unlimited tasks", "All games", "Weekly reports", "Color themes", "Reminders"],
      ru: ["Неограниченно детей", "Все задачи", "Все игры", "Отчёты", "Темы", "Напоминания"],
      ar: ["أطفال غير محدود", "مهام غير محدودة", "جميع الألعاب", "تقارير", "ثيمات", "تذكيرات"],
    },
    notIncluded: {
      he: ["חיבור WhatsApp", "משימות שיתופיות", "גיבוי"],
      en: ["WhatsApp", "Collaborative tasks", "Backup"],
      ru: ["WhatsApp", "Совместные задачи", "Бэкап"],
      ar: ["واتساب", "مهام مشتركة", "نسخ احتياطي"],
    },
  },
  {
    id: "family",
    icon: "🏠",
    color: "from-blue-500 to-teal-600",
    border: "border-blue-400",
    badge: null,
    price: { he: "₪29.90/חודש", en: "₪29.90/mo", ru: "₪29.90/мес", ar: "₪29.90/شهر" },
    features: {
      he: ["הכל בפרימיום", "חיבור WhatsApp", "משימות שיתופיות", "גיבוי אוטומטי", "תמיכה עדיפות"],
      en: ["Everything in Premium", "WhatsApp connection", "Collaborative tasks", "Auto backup", "Priority support"],
      ru: ["Всё из Premium", "WhatsApp", "Совместные задачи", "Авто бэкап", "Приоритетная поддержка"],
      ar: ["كل ما في بريميوم", "واتساب", "مهام مشتركة", "نسخ احتياطي", "دعم أولوية"],
    },
    notIncluded: { he: [], en: [], ru: [], ar: [] },
  },
];

export default function Pricing() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const tx = {
    he: { title: "בחר את התוכנית שלך", sub: "כל התוכניות כוללות ניסיון חינם של 14 יום", contact: "צרו קשר לגבי תשלום", back: "חזור" },
    en: { title: "Choose Your Plan", sub: "All plans include a 14-day free trial", contact: "Contact us for payment", back: "Back" },
    ru: { title: "Выберите тариф", sub: "Все планы включают 14-дневный пробный период", contact: "Свяжитесь с нами для оплаты", back: "Назад" },
    ar: { title: "اختر خطتك", sub: "جميع الخطط تشمل تجربة مجانية 14 يوماً", contact: "تواصل معنا للدفع", back: "رجوع" },
  };
  const t = tx[language] || tx.he;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 pb-20" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t.back}
        </Button>

        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-gray-800 mb-3"
          >
            {t.title}
          </motion.h1>
          <p className="text-gray-600 text-lg">{t.sub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => {
            const features = plan.features[language] || plan.features.he;
            const notIncluded = plan.notIncluded[language] || plan.notIncluded.he;
            const price = plan.price[language] || plan.price.he;
            const badgeText = plan.badge ? (plan.badge[language] || plan.badge.he) : null;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {badgeText && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-1 text-sm font-bold rounded-full shadow-lg">
                      {badgeText}
                    </Badge>
                  </div>
                )}

                <Card className={`border-2 ${plan.border} h-full ${plan.id === "premium" ? "shadow-2xl scale-105" : "shadow-lg"}`}>
                  <CardHeader className="text-center pb-2">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-4xl mb-3`}>
                      {plan.icon}
                    </div>
                    <CardTitle className="text-2xl capitalize">{plan.id}</CardTitle>
                    <div className={`text-3xl font-black mt-2 bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                      {price}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="text-gray-700 text-sm">{f}</span>
                      </div>
                    ))}
                    {notIncluded.map((f, j) => (
                      <div key={j} className="flex items-center gap-2 opacity-40">
                        <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                          <div className="w-3 h-0.5 bg-gray-400 rounded" />
                        </div>
                        <span className="text-gray-500 text-sm line-through">{f}</span>
                      </div>
                    ))}

                    <div className="pt-4">
                      {plan.id === "free" ? (
                        <Button
                          variant="outline"
                          className="w-full rounded-2xl"
                          onClick={() => navigate(createPageUrl("Dashboard"))}
                        >
                          {language === "he" ? "המשך חינמי" : language === "ru" ? "Продолжить бесплатно" : language === "ar" ? "استمر مجاناً" : "Continue Free"}
                        </Button>
                      ) : (
                        <Button
                          className={`w-full bg-gradient-to-r ${plan.color} text-white rounded-2xl font-bold`}
                          onClick={() => alert(t.contact)}
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          {language === "he" ? "שדרג עכשיו" : language === "ru" ? "Обновить" : language === "ar" ? "قم بالترقية" : "Upgrade Now"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-gray-500 mt-8 text-sm">
          {language === "he" ? "💳 אין צורך בכרטיס אשראי לתקופת הניסיון" : language === "ru" ? "💳 Кредитная карта не нужна для пробного периода" : language === "ar" ? "💳 لا حاجة لبطاقة ائتمان للتجربة" : "💳 No credit card required for trial"}
        </p>
      </div>
    </div>
  );
}