import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import Icon from "./shared/Icon";
import { useLanguage } from "@/components/LanguageContext";

export default function BackpackChecklistModal({ isOpen, onClose, onTaskComplete, task, profile }) {
  const [subjectsForTomorrow, setSubjectsForTomorrow] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  const loadChecklistData = useCallback(async () => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayIndex = tomorrow.getDay(); // 0 for Sunday, 1 for Monday...

      const [scheduleData, subjectsData] = await Promise.all([
        base44.entities.Schedule.filter({ child_profile_id: profile.id, day_of_week: dayIndex }),
        base44.entities.Subject.filter({ child_profile_id: profile.id })
      ]);

      const checklistItems = scheduleData
        .map(lesson => {
          const subjectDetails = subjectsData.find(s => s.id === lesson.subject_id);
          if (!subjectDetails) return null;
          return {
            ...subjectDetails,
            checked: false,
          };
        })
        .filter(Boolean); // Remove nulls if a subject wasn't found

      setSubjectsForTomorrow(checklistItems);
    } catch (error) {
      console.error("Error loading checklist data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (isOpen) {
      loadChecklistData();
    }
  }, [isOpen, loadChecklistData]);

  if (!task) return null;

  const handleCheckChange = (subjectId) => {
    setSubjectsForTomorrow(prev =>
      prev.map(subject =>
        subject.id === subjectId ? { ...subject, checked: !subject.checked } : subject
      )
    );
  };

  const allChecked = subjectsForTomorrow.length > 0 && subjectsForTomorrow.every(s => s.checked);

  const handleSubmit = () => {
    if (allChecked) {
      onTaskComplete(task); // The dashboard will handle token calculation
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full mx-4"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 -mt-16 border-4 border-white"
                  style={{ backgroundColor: task.color }}
                >
                  <Icon name={task.icon || "Briefcase"} className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{task.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{t('markCheckNextToSubject')}</p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {isLoading ? (
                <div className="text-center p-4">{t('loadingSchedule')}</div>
              ) : subjectsForTomorrow.length > 0 ? (
                subjectsForTomorrow.map(subject => (
                  <div key={subject.id} className="flex items-center space-x-2 space-x-reverse bg-gray-50 p-3 rounded-lg">
                    <Checkbox
                      id={`subject-${subject.id}`}
                      checked={subject.checked}
                      onCheckedChange={() => handleCheckChange(subject.id)}
                      className="w-5 h-5"
                    />
                    <Label
                      htmlFor={`subject-${subject.id}`}
                      className="text-base font-medium flex-1 cursor-pointer flex items-center gap-3"
                    >
                       <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: subject.color }}
                       >
                         <Icon name={subject.icon} className="w-4 h-4 text-white" />
                       </div>
                       {subject.name}
                    </Label>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 p-4">{t('noLessonsForTomorrow')}</div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button type="button" variant="outline" onClick={onClose} className="w-full">
                {t('cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!allChecked || isLoading}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                {t('finishedAllInBag')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}