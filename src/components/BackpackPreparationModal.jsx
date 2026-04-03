import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Circle, Backpack, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/components/LanguageContext';
import Icon from './shared/Icon';

export default function BackpackPreparationModal({ isOpen, onClose, childProfile }) {
  const { t, isRTL } = useLanguage();
  const [tomorrowSchedule, setTomorrowSchedule] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [specialNotes, setSpecialNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && childProfile) {
      loadTomorrowSchedule();
      loadSpecialNotes();
    }
  }, [isOpen, childProfile]);

  const loadTomorrowSchedule = async () => {
    try {
      setLoading(true);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDayOfWeek = tomorrow.getDay();

      // Load all subjects for this child
      const subjects = await base44.entities.Subject.filter({
        child_profile_id: childProfile.id,
        is_active: true
      });

      // Load schedule for tomorrow
      const schedules = await base44.entities.Schedule.filter({
        child_profile_id: childProfile.id,
        day_of_week: tomorrowDayOfWeek
      });

      // Match schedules with subjects
      const tomorrowLessons = schedules.map(schedule => {
        const subject = subjects.find(s => s.id === schedule.subject_id);
        return {
          ...schedule,
          subject: subject
        };
      }).filter(lesson => lesson.subject);

      setTomorrowSchedule(tomorrowLessons);
    } catch (error) {
      console.error('Error loading tomorrow schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialNotes = async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const notes = await base44.entities.ParentSpecialNote.filter({
        child_profile_id: childProfile.id,
        target_date: tomorrowStr,
        is_read: false
      });

      setSpecialNotes(notes);
    } catch (error) {
      console.error('Error loading special notes:', error);
    }
  };

  const toggleItem = (itemKey) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const markNoteAsRead = async (noteId) => {
    try {
      await base44.entities.ParentSpecialNote.update(noteId, { is_read: true });
      setSpecialNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error marking note as read:', error);
    }
  };

  const getAllItems = () => {
    const items = [];
    tomorrowSchedule.forEach((lesson, lessonIdx) => {
      if (lesson.subject?.required_materials && lesson.subject.required_materials.length > 0) {
        lesson.subject.required_materials.forEach((material, matIdx) => {
          items.push({
            key: `${lessonIdx}-${matIdx}`,
            label: material,
            subjectName: lesson.subject.name,
            subjectColor: lesson.subject.color,
            subjectIcon: lesson.subject.icon
          });
        });
      }
    });
    return items;
  };

  const allItems = getAllItems();
  const allChecked = allItems.length > 0 && allItems.every(item => checkedItems[item.key]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-3xl p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Backpack className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white leading-tight">
                  {isRTL ? '🎒 הכנת תיק למחר' : '🎒 Pack Backpack for Tomorrow'}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {isRTL ? 'מה צריך להביא מחר?' : 'What to bring tomorrow?'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('loadingSchedule')}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Special Notes from Parent */}
              {specialNotes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-base md:text-lg text-orange-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
                    {isRTL ? 'הודעות מיוחדות מההורים:' : 'Special Notes from Parents:'}
                  </h4>
                  {specialNotes.map(note => (
                    <Card key={note.id} className="p-3 md:p-4 bg-orange-50 border-2 border-orange-200">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-3">
                        <p className="text-sm md:text-base text-gray-800 flex-1">{note.message}</p>
                        <Button
                          size="sm"
                          onClick={() => markNoteAsRead(note.id)}
                          className="bg-orange-500 hover:bg-orange-600 flex-shrink-0 w-full md:w-auto"
                        >
                          {isRTL ? '✓ הבנתי' : '✓ Got it'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Tomorrow's Schedule */}
              {tomorrowSchedule.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    {t('noLessonsForTomorrow')}
                  </h4>
                  <p className="text-gray-600">
                    {isRTL ? 'אין שיעורים מחר - אפשר לנוח!' : 'No lessons tomorrow - time to rest!'}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="font-bold text-base md:text-lg text-gray-800 mb-3">
                      {isRTL ? 'מקצועות מחר:' : 'Tomorrow\'s Subjects:'}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                      {tomorrowSchedule.map((lesson, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 md:gap-2 p-2 md:p-3 rounded-xl border-2"
                          style={{ 
                            borderColor: lesson.subject.color,
                            backgroundColor: `${lesson.subject.color}15`
                          }}
                        >
                          <div 
                            className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: lesson.subject.color }}
                          >
                            <Icon name={lesson.subject.icon} className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          </div>
                          <span className="font-semibold text-xs md:text-sm text-gray-800 truncate">
                            {lesson.subject.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Checklist */}
                  {allItems.length > 0 ? (
                    <div>
                      <h4 className="font-bold text-base md:text-lg text-gray-800 mb-3">
                        {isRTL ? 'רשימת פריטים לארוז:' : 'Items to Pack:'}
                      </h4>
                      <div className="space-y-2">
                        {allItems.map(item => (
                          <button
                            key={item.key}
                            onClick={() => toggleItem(item.key)}
                            className={`w-full flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl border-2 transition-all ${
                              checkedItems[item.key]
                                ? 'bg-green-50 border-green-300'
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {checkedItems[item.key] ? (
                              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0" />
                            )}
                            <div className="flex-1 text-left min-w-0" dir={isRTL ? 'rtl' : 'ltr'}>
                              <p className={`font-semibold text-sm md:text-base ${checkedItems[item.key] ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                {item.label}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {isRTL ? 'ל' : 'for'}{item.subjectName}
                              </p>
                            </div>
                            <div 
                              className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: item.subjectColor }}
                            >
                              <Icon name={item.subjectIcon} className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <p className="text-gray-600">
                        {isRTL ? 'אין פריטים מיוחדים להביא מחר' : 'No special items to pack tomorrow'}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Done Button */}
              {allChecked && allItems.length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 md:px-8 py-4 md:py-6 text-base md:text-lg w-full md:w-auto"
                  >
                    ✅ {t('finishedAllInBag')}
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}