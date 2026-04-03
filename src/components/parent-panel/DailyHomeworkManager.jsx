import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, BookOpen, CheckCircle2 } from 'lucide-react';
import Icon from '../shared/Icon';
import { useLanguage } from '@/components/LanguageContext';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function DailyHomeworkManager({ profile, subjects, schedules, onDataChange, showSuccessMessage }) {
  const { t } = useLanguage();
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [tomorrowSchedules, setTomorrowSchedules] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (schedules && subjects) {
      loadDailySchedules();
    }
  }, [schedules, subjects]);

  const loadDailySchedules = () => {
    const today = new Date().getDay();
    const tomorrow = (today + 1) % 7;

    const todayLessons = schedules.filter(s => s.day_of_week === today);
    const tomorrowLessons = schedules.filter(s => s.day_of_week === tomorrow);

    // Enrich with subject data
    const enrichSchedules = (lessons) => lessons.map(lesson => ({
      ...lesson,
      subject: subjects.find(s => s.id === lesson.subject_id)
    })).filter(lesson => lesson.subject);

    setTodaySchedules(enrichSchedules(todayLessons));
    setTomorrowSchedules(enrichSchedules(tomorrowLessons));
  };

  const handleToggleHomework = async (scheduleId, currentValue) => {
    setIsUpdating(true);
    try {
      await base44.entities.Schedule.update(scheduleId, {
        has_homework: !currentValue
      });
      
      await onDataChange();
      loadDailySchedules();
      
      showSuccessMessage(t('settingsSaved') || 'העדכון בוצע בהצלחה');
    } catch (error) {
      console.error('Error updating homework status:', error);
      showSuccessMessage(t('errorSavingSettings') || 'שגיאה בעדכון');
    } finally {
      setIsUpdating(false);
    }
  };

  const DaySection = ({ title, daySchedules, dayName }) => (
    <Card>
      <CardHeader className="p-3 md:p-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-500 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t('markWhichSubjectsHaveHomework') || 'סמן אילו מקצועות יש להם שיעורי בית'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        {daySchedules.length > 0 ? (
          <div className="space-y-2 md:space-y-3">
            {daySchedules.map((schedule) => (
              <div 
                key={schedule.id} 
                className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors gap-2"
              >
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  <div
                    style={{ backgroundColor: schedule.subject.color }}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    <Icon name={schedule.subject.icon} className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm md:text-base truncate">{schedule.subject.name}</p>
                    {schedule.subject.teacher && (
                      <p className="text-xs md:text-sm text-gray-500 truncate">{schedule.subject.teacher}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                  {schedule.has_homework && (
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                  )}
                  <Switch
                    checked={schedule.has_homework || false}
                    onCheckedChange={() => handleToggleHomework(schedule.id, schedule.has_homework)}
                    disabled={isUpdating}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 md:py-8 text-gray-500">
            <BookOpen className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-xs md:text-sm">{t('noLessonsForDay') || `אין שיעורים ב${dayName}`}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const today = new Date().getDay();
  const tomorrow = (today + 1) % 7;

  return (
    <div className="space-y-3 md:space-y-6">
      <DaySection 
        title={`${t('todayHomework') || 'שיעורי בית להיום'} (${t(DAYS[today])})`}
        daySchedules={todaySchedules}
        dayName={t(DAYS[today])}
      />
      
      <DaySection 
        title={`${t('tomorrowHomework') || 'שיעורי בית למחר'} (${t(DAYS[tomorrow])})`}
        daySchedules={tomorrowSchedules}
        dayName={t(DAYS[tomorrow])}
      />
    </div>
  );
}