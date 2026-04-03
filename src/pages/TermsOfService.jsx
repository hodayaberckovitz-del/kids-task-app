import React from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, AlertCircle, Scale, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  const { t, isRTL } = useLanguage();

  const sections = {
    he: [
      {
        icon: FileText,
        title: "קבלת התנאים",
        content: "על ידי שימוש באפליקציה 'כוכב המשימות', אתה מסכים לתנאי השימוש הללו. אם אינך מסכים לתנאים אלה, אנא הימנע משימוש באפליקציה."
      },
      {
        icon: CheckCircle,
        title: "שימוש מותר",
        content: "האפליקציה מיועדת לשימוש אישי ומשפחתי בלבד. אתה רשאי להשתמש באפליקציה לניהול משימות ותגמולים עבור ילדיך, ליצור תוכן ולשתף עם בני משפחה."
      },
      {
        icon: Ban,
        title: "שימוש אסור",
        content: "אסור להשתמש באפליקציה לכל מטרה בלתי חוקית, להעתיק או להפיץ את התוכן ללא אישור, או לנסות לפגוע במערכת או במשתמשים אחרים."
      },
      {
        icon: Scale,
        title: "זכויות יוצרים",
        content: "כל התוכן באפליקציה, כולל עיצוב, קוד ותמונות, הוא בבעלות 'כוכב המשימות' ומוגן בזכויות יוצרים. התוכן שאתה יוצר נשאר שלך."
      },
      {
        icon: AlertCircle,
        title: "הגבלת אחריות",
        content: "האפליקציה מסופקת 'כמות שהיא'. איננו אחראים לכל נזק שעלול לנבוע משימוש באפליקציה או מאי יכולת להשתמש בה."
      }
    ],
    en: [
      {
        icon: FileText,
        title: "Acceptance of Terms",
        content: "By using the 'Task Star' application, you agree to these terms of service. If you do not agree to these terms, please refrain from using the application."
      },
      {
        icon: CheckCircle,
        title: "Permitted Use",
        content: "The application is intended for personal and family use only. You may use the application to manage tasks and rewards for your children, create content, and share with family members."
      },
      {
        icon: Ban,
        title: "Prohibited Use",
        content: "You may not use the application for any illegal purpose, copy or distribute content without permission, or attempt to harm the system or other users."
      },
      {
        icon: Scale,
        title: "Copyright",
        content: "All content in the application, including design, code, and images, is owned by 'Task Star' and protected by copyright. Content you create remains yours."
      },
      {
        icon: AlertCircle,
        title: "Limitation of Liability",
        content: "The application is provided 'as is'. We are not responsible for any damage that may result from using the application or inability to use it."
      }
    ],
    ru: [
      {
        icon: FileText,
        title: "Принятие условий",
        content: "Используя приложение 'Task Star', вы соглашаетесь с этими условиями предоставления услуг. Если вы не согласны с этими условиями, пожалуйста, воздержитесь от использования приложения."
      },
      {
        icon: CheckCircle,
        title: "Разрешенное использование",
        content: "Приложение предназначено только для личного и семейного использования. Вы можете использовать приложение для управления задачами и наградами для своих детей, создания контента и обмена с членами семьи."
      },
      {
        icon: Ban,
        title: "Запрещенное использование",
        content: "Вы не можете использовать приложение в каких-либо незаконных целях, копировать или распространять контент без разрешения или пытаться нанести вред системе или другим пользователям."
      },
      {
        icon: Scale,
        title: "Авторские права",
        content: "Весь контент в приложении, включая дизайн, код и изображения, принадлежит 'Task Star' и защищен авторским правом. Созданный вами контент остается вашим."
      },
      {
        icon: AlertCircle,
        title: "Ограничение ответственности",
        content: "Приложение предоставляется 'как есть'. Мы не несем ответственности за любой ущерб, который может возникнуть в результате использования приложения или невозможности его использования."
      }
    ],
    ar: [
      {
        icon: FileText,
        title: "قبول الشروط",
        content: "باستخدام تطبيق 'نجمة المهام'، فإنك توافق على شروط الخدمة هذه. إذا كنت لا توافق على هذه الشروط، يرجى الامتناع عن استخدام التطبيق."
      },
      {
        icon: CheckCircle,
        title: "الاستخدام المسموح",
        content: "التطبيق مخصص للاستخدام الشخصي والعائلي فقط. يمكنك استخدام التطبيق لإدارة المهام والمكافآت لأطفالك، وإنشاء محتوى ومشاركته مع أفراد العائلة."
      },
      {
        icon: Ban,
        title: "الاستخدام المحظور",
        content: "لا يجوز استخدام التطبيق لأي غرض غير قانوني، أو نسخ أو توزيع المحتوى دون إذن، أو محاولة الإضرار بالنظام أو المستخدمين الآخرين."
      },
      {
        icon: Scale,
        title: "حقوق النشر",
        content: "جميع المحتويات في التطبيق، بما في ذلك التصميم والكود والصور، مملوكة لـ 'نجمة المهام' ومحمية بحقوق النشر. المحتوى الذي تنشئه يبقى لك."
      },
      {
        icon: AlertCircle,
        title: "حدود المسؤولية",
        content: "يتم توفير التطبيق 'كما هو'. نحن غير مسؤولين عن أي ضرر قد ينتج عن استخدام التطبيق أو عدم القدرة على استخدامه."
      }
    ]
  };

  const { language } = useLanguage();
  const content = sections[language] || sections.he;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
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
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block text-6xl mb-4"
            >
              📋
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
              {language === 'he' ? 'תנאי שימוש' : 
               language === 'ar' ? 'شروط الخدمة' : 
               language === 'ru' ? 'Условия предоставления услуг' : 
               'Terms of Service'}
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
              <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
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
          className="mt-8 p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-lg"
        >
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            {language === 'he' ? 'שינויים בתנאים' : 
             language === 'ar' ? 'تغييرات في الشروط' : 
             language === 'ru' ? 'Изменения в условиях' : 
             'Changes to Terms'}
          </h3>
          <p className="text-gray-700">
            {language === 'he' ? 'אנו שומרים לעצמנו את הזכות לעדכן את התנאים הללו בכל עת. שינויים מהותיים יימסרו לך באמצעות האפליקציה או באמצעות אימייל.' : 
             language === 'ar' ? 'نحتفظ بالحق في تحديث هذه الشروط في أي وقت. سيتم إبلاغك بالتغييرات الجوهرية من خلال التطبيق أو عبر البريد الإلكتروني.' : 
             language === 'ru' ? 'Мы оставляем за собой право обновлять эти условия в любое время. О существенных изменениях вы будете уведомлены через приложение или по электронной почте.' : 
             'We reserve the right to update these terms at any time. Material changes will be communicated to you through the app or via email.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-gray-600"
        >
          <p className="text-sm">
            {language === 'he' ? 'על ידי שימוש באפליקציה, אתה מסכים לתנאי השימוש שלנו' : 
             language === 'ar' ? 'باستخدام التطبيق، فإنك توافق على شروط الخدمة الخاصة بنا' : 
             language === 'ru' ? 'Используя приложение, вы соглашаетесь с нашими условиями предоставления услуг' : 
             'By using the app, you agree to our terms of service'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}