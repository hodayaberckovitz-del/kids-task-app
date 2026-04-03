import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, UserCheck, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  const { t, isRTL } = useLanguage();

  const sections = {
    he: [
      {
        icon: Shield,
        title: "איסוף מידע",
        content: "אנו אוספים מידע שאתה מספק לנו בעת יצירת חשבון, כולל שם, כתובת אימייל, ומידע על ילדיך. מידע זה נאסף אך ורק לצורך הפעלת האפליקציה ושיפור החוויה שלך."
      },
      {
        icon: Lock,
        title: "אבטחת מידע",
        content: "אנו משתמשים באמצעי אבטחה מתקדמים כדי להגן על המידע שלך. כל המידע מוצפן ומאוחסן בשרתים מאובטחים. איננו משתפים את המידע שלך עם צדדים שלישיים ללא הסכמתך המפורשת."
      },
      {
        icon: Eye,
        title: "שימוש במידע",
        content: "אנו משתמשים במידע שלך כדי לספק ולשפר את שירותי האפליקציה, לשלוח לך עדכונים חשובים, ולעזור לך לנהל את משימות המשפחה שלך. איננו משתמשים במידע שלך למטרות פרסום או שיווק."
      },
      {
        icon: UserCheck,
        title: "הזכויות שלך",
        content: "יש לך זכות לגשת למידע שלך, לעדכן אותו או למחוק אותו בכל עת. אתה יכול גם לבקש להסיר את חשבונך לחלוטין מהמערכת."
      },
      {
        icon: Mail,
        title: "צור קשר",
        content: "אם יש לך שאלות או חששות לגבי מדיניות הפרטיות שלנו, אנא צור איתנו קשר בכתובת: support@taskstar.app"
      }
    ],
    en: [
      {
        icon: Shield,
        title: "Information Collection",
        content: "We collect information you provide when creating an account, including name, email address, and information about your children. This information is collected solely for operating the application and improving your experience."
      },
      {
        icon: Lock,
        title: "Data Security",
        content: "We use advanced security measures to protect your information. All data is encrypted and stored on secure servers. We do not share your information with third parties without your explicit consent."
      },
      {
        icon: Eye,
        title: "Information Usage",
        content: "We use your information to provide and improve the application's services, send you important updates, and help you manage your family tasks. We do not use your information for advertising or marketing purposes."
      },
      {
        icon: UserCheck,
        title: "Your Rights",
        content: "You have the right to access, update, or delete your information at any time. You can also request to completely remove your account from the system."
      },
      {
        icon: Mail,
        title: "Contact Us",
        content: "If you have questions or concerns about our privacy policy, please contact us at: support@taskstar.app"
      }
    ],
    ru: [
      {
        icon: Shield,
        title: "Сбор информации",
        content: "Мы собираем информацию, которую вы предоставляете при создании учетной записи, включая имя, адрес электронной почты и информацию о ваших детях. Эта информация собирается исключительно для работы приложения и улучшения вашего опыта."
      },
      {
        icon: Lock,
        title: "Безопасность данных",
        content: "Мы используем передовые меры безопасности для защиты вашей информации. Все данные зашифрованы и хранятся на защищенных серверах. Мы не передаем вашу информацию третьим лицам без вашего явного согласия."
      },
      {
        icon: Eye,
        title: "Использование информации",
        content: "Мы используем вашу информацию для предоставления и улучшения услуг приложения, отправки важных обновлений и помощи в управлении семейными задачами. Мы не используем вашу информацию в рекламных или маркетинговых целях."
      },
      {
        icon: UserCheck,
        title: "Ваши права",
        content: "Вы имеете право получать доступ к своей информации, обновлять или удалять ее в любое время. Вы также можете запросить полное удаление своей учетной записи из системы."
      },
      {
        icon: Mail,
        title: "Свяжитесь с нами",
        content: "Если у вас есть вопросы или опасения по поводу нашей политики конфиденциальности, пожалуйста, свяжитесь с нами по адресу: support@taskstar.app"
      }
    ],
    ar: [
      {
        icon: Shield,
        title: "جمع المعلومات",
        content: "نقوم بجمع المعلومات التي تقدمها عند إنشاء حساب، بما في ذلك الاسم وعنوان البريد الإلكتروني ومعلومات عن أطفالك. يتم جمع هذه المعلومات فقط لتشغيل التطبيق وتحسين تجربتك."
      },
      {
        icon: Lock,
        title: "أمان البيانات",
        content: "نستخدم تدابير أمنية متقدمة لحماية معلوماتك. يتم تشفير جميع البيانات وتخزينها على خوادم آمنة. لا نشارك معلوماتك مع أطراف ثالثة دون موافقتك الصريحة."
      },
      {
        icon: Eye,
        title: "استخدام المعلومات",
        content: "نستخدم معلوماتك لتوفير وتحسين خدمات التطبيق، وإرسال تحديثات مهمة لك، ومساعدتك في إدارة مهام عائلتك. لا نستخدم معلوماتك لأغراض إعلانية أو تسويقية."
      },
      {
        icon: UserCheck,
        title: "حقوقك",
        content: "لديك الحق في الوصول إلى معلوماتك أو تحديثها أو حذفها في أي وقت. يمكنك أيضًا طلب إزالة حسابك بالكامل من النظام."
      },
      {
        icon: Mail,
        title: "اتصل بنا",
        content: "إذا كان لديك أسئلة أو مخاوف بشأن سياسة الخصوصية الخاصة بنا، يرجى الاتصال بنا على: support@taskstar.app"
      }
    ]
  };

  const { language } = useLanguage();
  const content = sections[language] || sections.he;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" className="mb-4">
              ← {language === 'he' ? 'חזרה' : language === 'ar' ? 'عودة' : language === 'ru' ? 'Назад' : 'Back'}
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block text-6xl mb-4"
            >
              🔒
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
              {language === 'he' ? 'מדיניות פרטיות' : 
               language === 'ar' ? 'سياسة الخصوصية' : 
               language === 'ru' ? 'Политика конфиденциальности' : 
               'Privacy Policy'}
            </h1>
            <p className="text-lg text-gray-600">
              {language === 'he' ? 'עודכן לאחרונה: דצמבר 2025' : 
               language === 'ar' ? 'آخر تحديث: ديسمبر 2025' : 
               language === 'ru' ? 'Последнее обновление: декабрь 2025 г.' : 
               'Last updated: December 2025'}
            </p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {content.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-gray-600"
        >
          <p className="text-sm">
            {language === 'he' ? 'על ידי שימוש באפליקציה, אתה מסכים למדיניות הפרטיות שלנו' : 
             language === 'ar' ? 'باستخدام التطبيق، فإنك توافق على سياسة الخصوصية الخاصة بنا' : 
             language === 'ru' ? 'Используя приложение, вы соглашаетесь с нашей политикой конфиденциальности' : 
             'By using the app, you agree to our privacy policy'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}