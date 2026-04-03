import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { BookOpen, Send, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

const TRANSLATIONS = {
  he: {
    title: 'פאנל מורה',
    subtitle: 'שלח שיעורי בית לתלמידים שלך',
    linkFamily: 'קישור משפחה',
    familyCodePlaceholder: 'הזן קוד משפחה (לדוגמה: ABC123)',
    linking: 'מקשר...',
    link: 'קשר',
    sendHomework: 'שליחת שיעורי בית',
    subjectPlaceholder: 'מקצוע (לדוגמה: מתמטיקה)',
    homeworkDescPlaceholder: 'תיאור שיעורי הבית',
    selectStudents: 'בחר תלמידים:',
    sending: 'שולח...',
    sendTo: (n) => `שלח ל-${n} תלמיד/ים`,
    recentlySent: '📋 נשלח לאחרונה',
    dueDate: 'תאריך הגשה:',
    completed: '✓ הושלם',
    noStudents: 'אין תלמידים עדיין',
    noStudentsDesc: 'קשר משפחה באמצעות קוד המשפחה למעלה',
    familyLinked: 'המשפחה קושרה בהצלחה!',
    familyNotFound: 'קוד משפחה לא נמצא',
    alreadyLinked: 'המשפחה כבר מקושרת',
    fillFields: 'מלא את כל השדות ובחר תלמידים',
    homeworkSent: (n) => `שיעורי הבית נשלחו ל-${n} תלמיד/ים!`,
  },
  en: {
    title: 'Teacher Panel',
    subtitle: 'Send homework to your students',
    linkFamily: 'Link Family',
    familyCodePlaceholder: 'Enter family code (e.g. ABC123)',
    linking: 'Linking...',
    link: 'Link',
    sendHomework: 'Send Homework',
    subjectPlaceholder: 'Subject (e.g. Mathematics)',
    homeworkDescPlaceholder: 'Homework description',
    selectStudents: 'Select students:',
    sending: 'Sending...',
    sendTo: (n) => `Send to ${n} student(s)`,
    recentlySent: '📋 Recently Sent',
    dueDate: 'Due date:',
    completed: '✓ Completed',
    noStudents: 'No students yet',
    noStudentsDesc: 'Link a family using the family code above',
    familyLinked: 'Family linked successfully!',
    familyNotFound: 'Family code not found',
    alreadyLinked: 'Family already linked',
    fillFields: 'Fill all fields and select students',
    homeworkSent: (n) => `Homework sent to ${n} student(s)!`,
  },
  ru: {
    title: 'Панель учителя',
    subtitle: 'Отправьте домашнее задание своим ученикам',
    linkFamily: 'Привязать семью',
    familyCodePlaceholder: 'Введите код семьи (например: ABC123)',
    linking: 'Привязка...',
    link: 'Привязать',
    sendHomework: 'Отправить домашнее задание',
    subjectPlaceholder: 'Предмет (например: Математика)',
    homeworkDescPlaceholder: 'Описание домашнего задания',
    selectStudents: 'Выберите учеников:',
    sending: 'Отправка...',
    sendTo: (n) => `Отправить ${n} ученик(ам)`,
    recentlySent: '📋 Недавно отправленные',
    dueDate: 'Срок сдачи:',
    completed: '✓ Выполнено',
    noStudents: 'Пока нет учеников',
    noStudentsDesc: 'Привяжите семью с помощью кода выше',
    familyLinked: 'Семья успешно привязана!',
    familyNotFound: 'Код семьи не найден',
    alreadyLinked: 'Семья уже привязана',
    fillFields: 'Заполните все поля и выберите учеников',
    homeworkSent: (n) => `Домашнее задание отправлено ${n} ученик(ам)!`,
  },
  ar: {
    title: 'لوحة المعلم',
    subtitle: 'أرسل الواجبات المنزلية لطلابك',
    linkFamily: 'ربط العائلة',
    familyCodePlaceholder: 'أدخل رمز العائلة (مثال: ABC123)',
    linking: 'جاري الربط...',
    link: 'ربط',
    sendHomework: 'إرسال الواجب المنزلي',
    subjectPlaceholder: 'المادة (مثال: الرياضيات)',
    homeworkDescPlaceholder: 'وصف الواجب المنزلي',
    selectStudents: 'اختر الطلاب:',
    sending: 'جاري الإرسال...',
    sendTo: (n) => `إرسال إلى ${n} طالب`,
    recentlySent: '📋 المرسل مؤخراً',
    dueDate: 'تاريخ الاستحقاق:',
    completed: '✓ مكتمل',
    noStudents: 'لا يوجد طلاب بعد',
    noStudentsDesc: 'اربط عائلة باستخدام رمز العائلة أعلاه',
    familyLinked: 'تم ربط العائلة بنجاح!',
    familyNotFound: 'رمز العائلة غير موجود',
    alreadyLinked: 'العائلة مرتبطة بالفعل',
    fillFields: 'املأ جميع الحقول واختر الطلاب',
    homeworkSent: (n) => `تم إرسال الواجب إلى ${n} طالب!`,
  },
};

export default function TeacherPanel() {
  const { language, direction, isRTL } = useLanguage();
  const T = TRANSLATIONS[language] || TRANSLATIONS.he;

  const [user, setUser] = useState(null);
  const [linkedFamilies, setLinkedFamilies] = useState([]);
  const [children, setChildren] = useState([]);
  const [homework, setHomework] = useState({ title: '', due_date: '', subject_name: '' });
  const [selectedChildIds, setSelectedChildIds] = useState([]);
  const [existingHomework, setExistingHomework] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [familyCode, setFamilyCode] = useState('');
  const [linkingCode, setLinkingCode] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const u = await base44.auth.me();
    setUser(u);

    const codes = u.teacher_family_codes || [];
    const familiesArr = [];
    const childrenArr = [];

    for (const code of codes) {
      const fams = await base44.entities.Family.filter({ family_code: code });
      if (fams.length > 0) {
        familiesArr.push(fams[0]);
        const kids = await base44.entities.ChildProfile.filter({ family_id: fams[0].id });
        childrenArr.push(...kids);
      }
    }

    setLinkedFamilies(familiesArr);
    setChildren(childrenArr);

    const hw = await base44.entities.HomeworkTask.filter({ created_by: u.email });
    setExistingHomework(hw.slice(0, 20));
    setIsLoading(false);
  };

  const handleLinkFamily = async () => {
    if (!familyCode.trim()) return;
    setLinkingCode(true);
    const fams = await base44.entities.Family.filter({ family_code: familyCode.toUpperCase().trim() });
    if (fams.length === 0) {
      toast.error(T.familyNotFound);
      setLinkingCode(false);
      return;
    }
    const codes = user.teacher_family_codes || [];
    if (!codes.includes(familyCode.toUpperCase())) {
      const newCodes = [...codes, familyCode.toUpperCase()];
      await base44.auth.updateMe({ teacher_family_codes: newCodes });
      toast.success(T.familyLinked);
      setFamilyCode('');
      init();
    } else {
      toast.info(T.alreadyLinked);
    }
    setLinkingCode(false);
  };

  const handleSendHomework = async () => {
    if (!homework.title || !homework.due_date || selectedChildIds.length === 0) {
      toast.error(T.fillFields);
      return;
    }
    setIsSending(true);

    for (const childId of selectedChildIds) {
      const child = children.find(c => c.id === childId);
      if (!child) continue;

      let subjects = await base44.entities.Subject.filter({ family_id: child.family_id, name: homework.subject_name || 'School' });
      let subjectId;
      if (subjects.length > 0) {
        subjectId = subjects[0].id;
      } else {
        const s = await base44.entities.Subject.create({
          name: homework.subject_name || 'School',
          color: '#6366f1',
          icon: 'BookOpen',
          family_id: child.family_id,
          child_profile_id: childId,
        });
        subjectId = s.id;
      }

      await base44.entities.HomeworkTask.create({
        title: homework.title,
        subject_id: subjectId,
        due_date: homework.due_date,
        assigned_date: format(new Date(), 'yyyy-MM-dd'),
        child_profile_id: childId,
        family_id: child.family_id,
      });
    }

    toast.success(T.homeworkSent(selectedChildIds.length));
    setHomework({ title: '', due_date: '', subject_name: '' });
    setSelectedChildIds([]);
    setIsSending(false);
    init();
  };

  const toggleChild = (id) => {
    setSelectedChildIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8" dir={direction}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800">{T.title}</h1>
            <p className="text-gray-500">{T.subtitle}</p>
          </div>
        </div>

        {/* Link Family */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-indigo-500" />
              {T.linkFamily}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder={T.familyCodePlaceholder}
                value={familyCode}
                onChange={e => setFamilyCode(e.target.value.toUpperCase())}
                className="flex-1 uppercase"
                maxLength={6}
                dir="ltr"
              />
              <Button onClick={handleLinkFamily} disabled={linkingCode} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                {linkingCode ? T.linking : T.link}
              </Button>
            </div>
            {linkedFamilies.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {linkedFamilies.map(f => (
                  <span key={f.id} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    👨‍👩‍👧 {f.family_name}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Send Homework */}
        {children.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="w-5 h-5 text-green-500" />
                {T.sendHomework}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder={T.subjectPlaceholder}
                value={homework.subject_name}
                onChange={e => setHomework(h => ({ ...h, subject_name: e.target.value }))}
              />
              <Input
                placeholder={T.homeworkDescPlaceholder}
                value={homework.title}
                onChange={e => setHomework(h => ({ ...h, title: e.target.value }))}
              />
              <Input
                type="date"
                value={homework.due_date}
                onChange={e => setHomework(h => ({ ...h, due_date: e.target.value }))}
                dir="ltr"
              />

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">{T.selectStudents}</p>
                <div className="grid grid-cols-2 gap-2">
                  {children.map(child => (
                    <label
                      key={child.id}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedChildIds.includes(child.id)
                          ? 'border-indigo-400 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedChildIds.includes(child.id)}
                        onChange={() => toggleChild(child.id)}
                        className="w-4 h-4 accent-indigo-600"
                      />
                      <span className="font-medium text-gray-800">{child.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSendHomework}
                disabled={isSending}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3"
              >
                <Send className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isSending ? T.sending : T.sendTo(selectedChildIds.length)}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent homework */}
        {existingHomework.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{T.recentlySent}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {existingHomework.map(hw => (
                <div key={hw.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{hw.title}</p>
                    <p className="text-xs text-gray-500">{T.dueDate} {hw.due_date}</p>
                  </div>
                  {hw.is_completed && (
                    <span className="text-green-600 text-xs font-bold">{T.completed}</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {children.length === 0 && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-lg">{T.noStudents}</p>
              <p className="text-sm mt-1">{T.noStudentsDesc}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}