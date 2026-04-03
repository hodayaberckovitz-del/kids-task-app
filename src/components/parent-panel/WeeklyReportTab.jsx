import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, Flame, Star, Trophy } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

const DAY_LABELS = {
  he: ['ראש', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  ar: ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'],
};

export default function WeeklyReportTab({ childProfiles = [], selectedChildId }) {
  const { t, language, isRTL } = useLanguage();
  const [reportChildId, setReportChildId] = useState(selectedChildId || childProfiles[0]?.id || null);
  const [completions, setCompletions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedChildId) setReportChildId(selectedChildId);
  }, [selectedChildId]);

  useEffect(() => {
    if (reportChildId) loadReport();
  }, [reportChildId]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      const startDate = format(subDays(today, 29), 'yyyy-MM-dd');

      const [completionsData, tasksData] = await Promise.all([
        base44.entities.TaskCompletion.filter({ child_profile_id: reportChildId }),
        base44.entities.Task.filter({ child_profile_id: reportChildId }),
      ]);

      // Filter to last 30 days
      const recent = completionsData.filter(c => c.completed_date >= startDate);
      setCompletions(recent);
      setTasks(tasksData);
    } catch (err) {
      console.error("Error loading report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const profile = childProfiles.find(c => c.id === reportChildId);

  // ---- Compute stats ----
  const today = new Date();

  // Last 7 days per-day counts
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayIdx = d.getDay();
    const count = completions.filter(c => c.completed_date === dateStr).length;
    const tokens = completions.filter(c => c.completed_date === dateStr).reduce((s, c) => s + (c.tokens_earned || 0), 0);
    return {
      day: (DAY_LABELS[language] || DAY_LABELS.en)[dayIdx],
      date: dateStr,
      count,
      tokens,
    };
  });

  // Last 30 days per-day for trend line
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(today, 29 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const count = completions.filter(c => c.completed_date === dateStr).length;
    return { date: format(d, 'MM/dd'), count };
  });

  // This week
  const thisWeekStart = format(startOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd');
  const thisWeekEnd = format(endOfWeek(today, { weekStartsOn: 0 }), 'yyyy-MM-dd');
  const thisWeekCompletions = completions.filter(c => c.completed_date >= thisWeekStart && c.completed_date <= thisWeekEnd);
  const thisWeekTokens = thisWeekCompletions.reduce((s, c) => s + (c.tokens_earned || 0), 0);

  // Most active day
  const maxDay = last7Days.reduce((best, d) => d.count > best.count ? d : best, last7Days[0]);

  // Task completion rates
  const taskStats = tasks.map(task => {
    const done = completions.filter(c => c.task_id === task.id).length;
    return { task, done };
  });
  const sortedByDone = [...taskStats].sort((a, b) => b.done - a.done);
  const topTasks = sortedByDone.slice(0, 3);
  const skippedTasks = sortedByDone.filter(t => t.done === 0);

  // Streak (consecutive days with at least 1 completion)
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(today, i), 'yyyy-MM-dd');
    if (completions.some(c => c.completed_date === d)) streak++;
    else break;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!reportChildId || childProfiles.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-12 text-center text-gray-500">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-lg font-semibold">{t('pleaseSelectChild')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Child selector */}
      {childProfiles.length > 1 && (
        <Select value={reportChildId} onValueChange={setReportChildId}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {childProfiles.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Profile header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl">
          ⭐
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{profile?.name}</h2>
          <p className="text-gray-500 text-sm">
            {language === 'he' ? 'דוח שבועי' : language === 'ru' ? 'Еженедельный отчёт' : language === 'ar' ? 'التقرير الأسبوعي' : 'Weekly Report'}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
            value: thisWeekCompletions.length,
            label: language === 'he' ? 'השלמות השבוע' : language === 'ru' ? 'Выполнено за неделю' : language === 'ar' ? 'إنجازات الأسبوع' : 'This Week',
            bg: 'from-green-50 to-emerald-50',
            border: 'border-green-200',
          },
          {
            icon: <Star className="w-6 h-6 text-yellow-500" />,
            value: thisWeekTokens,
            label: language === 'he' ? 'אסימונים השבוע' : language === 'ru' ? 'Жетонов за неделю' : language === 'ar' ? 'رموز الأسبوع' : 'Tokens Earned',
            bg: 'from-yellow-50 to-orange-50',
            border: 'border-yellow-200',
          },
          {
            icon: <Flame className="w-6 h-6 text-orange-500" />,
            value: streak,
            label: language === 'he' ? 'ימי רצף' : language === 'ru' ? 'Дней подряд' : language === 'ar' ? 'أيام متتالية' : 'Day Streak',
            bg: 'from-orange-50 to-red-50',
            border: 'border-orange-200',
          },
          {
            icon: <Trophy className="w-6 h-6 text-purple-600" />,
            value: maxDay?.day || '-',
            label: language === 'he' ? 'יום הכי פעיל' : language === 'ru' ? 'Самый активный день' : language === 'ar' ? 'أنشط يوم' : 'Most Active Day',
            bg: 'from-purple-50 to-pink-50',
            border: 'border-purple-200',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`bg-gradient-to-br ${stat.bg} border-2 ${stat.border}`}>
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-3xl font-black text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bar chart - last 7 days */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'he' ? '📊 משימות לפי יום (7 ימים אחרונים)' : language === 'ru' ? '📊 Задачи по дням (7 дней)' : language === 'ar' ? '📊 المهام حسب اليوم (7 أيام)' : '📊 Tasks per Day (Last 7 Days)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(val, name) => [val, name === 'count' ? (language === 'he' ? 'משימות' : 'Tasks') : (language === 'he' ? 'אסימונים' : 'Tokens')]}
              />
              <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="count" />
              <Bar dataKey="tokens" fill="#F59E0B" radius={[4, 4, 0, 0]} name="tokens" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trend line - last 30 days */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'he' ? '📈 גרף התקדמות (30 ימים)' : language === 'ru' ? '📈 Прогресс (30 дней)' : language === 'ar' ? '📈 الأداء (30 يوماً)' : '📈 Progress Trend (30 Days)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={last30Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top tasks & skipped tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top performed tasks */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-base text-green-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {language === 'he' ? '✅ המשימות הכי אהובות' : language === 'ru' ? '✅ Самые выполняемые' : language === 'ar' ? '✅ المهام الأكثر إنجازاً' : '✅ Top Tasks'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">{t('noTasksYet')}</p>
            ) : topTasks.map(({ task, done }) => (
              <div key={task.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: task.color }}>
                    <span className="text-white text-xs font-bold">{task.icon?.slice(0, 1)}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[130px]">{task.title}</span>
                </div>
                <Badge className="bg-green-100 text-green-800">{done}x</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skipped tasks */}
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-700 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {language === 'he' ? '⚠️ משימות שמדלגים עליהן' : language === 'ru' ? '⚠️ Пропускаемые задачи' : language === 'ar' ? '⚠️ المهام المُهملة' : '⚠️ Skipped Tasks'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {skippedTasks.length === 0 ? (
              <p className="text-green-600 text-sm font-medium">
                {language === 'he' ? '🎉 כל המשימות בוצעו!' : language === 'ru' ? '🎉 Все задачи выполнены!' : language === 'ar' ? '🎉 جميع المهام منجزة!' : '🎉 All tasks completed!'}
              </p>
            ) : skippedTasks.slice(0, 5).map(({ task }) => (
              <div key={task.id} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100">
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm font-medium text-gray-700 truncate">{task.title}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}