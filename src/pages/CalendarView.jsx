import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ArrowLeft, Printer } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const MONTH_NAMES = {
  he: ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  ru: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
  ar: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
};
const DAY_NAMES = {
  he: ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"],
  en: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
  ru: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
  ar: ["أحد","اثن","ثلا","أرب","خمي","جمع","سبت"],
};

export default function CalendarView() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [completionsByDate, setCompletionsByDate] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const tx = {
    he: { title: "לוח שנה", back: "חזור", perfect: "ימים מושלמים", longestStreak: "הרצף הארוך", completion: "אחוז ביצוע", print: "הדפסת תעודה", months: MONTH_NAMES.he, days: DAY_NAMES.he },
    en: { title: "Calendar", back: "Back", perfect: "Perfect days", longestStreak: "Longest streak", completion: "Completion", print: "Print Certificate", months: MONTH_NAMES.en, days: DAY_NAMES.en },
    ru: { title: "Календарь", back: "Назад", perfect: "Идеальных дней", longestStreak: "Лучшая серия", completion: "Выполнение", print: "Распечатать диплом", months: MONTH_NAMES.ru, days: DAY_NAMES.ru },
    ar: { title: "التقويم", back: "رجوع", perfect: "أيام مثالية", longestStreak: "أطول سلسلة", completion: "الإنجاز", print: "طباعة الشهادة", months: MONTH_NAMES.ar, days: DAY_NAMES.ar },
  };
  const t = tx[language] || tx.he;

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await base44.auth.me();
      const selectedChildId = localStorage.getItem("selectedChildId");

      const children = await base44.entities.ChildProfile.filter({ family_id: user.family_id });
      const child = children.find((c) => c.id === selectedChildId) || children[0];
      if (!child) { setIsLoading(false); return; }
      setProfile(child);

      const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      const [allTasks, completions] = await Promise.all([
        base44.entities.Task.filter({ child_profile_id: child.id, is_active: true }),
        base44.entities.TaskCompletion.filter({ child_profile_id: child.id }),
      ]);

      const filtered = completions.filter((c) => c.completed_date >= monthStart && c.completed_date <= monthEnd);

      const totalTasks = allTasks.length;
      const byDate = {};
      filtered.forEach((c) => {
        byDate[c.completed_date] = (byDate[c.completed_date] || 0) + 1;
      });

      // Store {count, total} per day
      const result = {};
      Object.keys(byDate).forEach((d) => {
        result[d] = { count: byDate[d], total: totalTasks };
      });

      setTasks(allTasks);
      setCompletionsByDate(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayStatus = (dateStr) => {
    const data = completionsByDate[dateStr];
    if (!data || data.count === 0) return "empty";
    if (data.total === 0) return "empty";
    const pct = data.count / data.total;
    if (pct >= 1) return "full";
    if (pct >= 0.5) return "half";
    return "low";
  };

  const getDayEmoji = (status) => {
    if (status === "full") return "⭐";
    if (status === "half") return "✨";
    if (status === "low") return "💫";
    return "";
  };

  // Stats for this month
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const today = format(new Date(), "yyyy-MM-dd");
  const pastDays = days.filter((d) => format(d, "yyyy-MM-dd") <= today);
  const perfectDays = pastDays.filter((d) => getDayStatus(format(d, "yyyy-MM-dd")) === "full").length;
  const completionPct = pastDays.length > 0 ? Math.round((perfectDays / pastDays.length) * 100) : 0;

  // Longest streak
  let longest = 0, cur = 0;
  pastDays.forEach((d) => {
    const s = getDayStatus(format(d, "yyyy-MM-dd"));
    if (s === "full" || s === "half") { cur++; longest = Math.max(longest, cur); }
    else cur = 0;
  });

  // Calendar grid
  const firstDay = getDay(startOfMonth(currentMonth));
  const blanks = Array.from({ length: firstDay });

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>${profile?.name} - ${t.months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
        h1 { font-size: 36px; color: #7C3AED; }
        .stars { font-size: 28px; margin: 20px 0; }
        .stat { display: inline-block; margin: 10px 20px; }
        .stat .num { font-size: 48px; font-weight: 900; color: #7C3AED; }
        .stat .lbl { font-size: 14px; color: #555; }
        .badge { background: linear-gradient(135deg, #F59E0B, #EF4444); color: white; border-radius: 999px; padding: 8px 24px; font-size: 18px; font-weight: bold; display: inline-block; margin-top: 20px; }
      </style></head>
      <body>
        <h1>🏆 ${t.title} - ${profile?.name}</h1>
        <div class="stars">${"⭐".repeat(Math.min(perfectDays, 10))}</div>
        <div>
          <div class="stat"><div class="num">${perfectDays}</div><div class="lbl">${t.perfect}</div></div>
          <div class="stat"><div class="num">${longest}</div><div class="lbl">${t.longestStreak}</div></div>
          <div class="stat"><div class="num">${completionPct}%</div><div class="lbl">${t.completion}</div></div>
        </div>
        <div class="badge">${t.months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20" dir={isRTL ? "rtl" : "ltr"}>
      <Button variant="ghost" onClick={() => navigate(createPageUrl("Dashboard"))} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> {t.back}
      </Button>

      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-black text-gray-800">
          {t.months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h1>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {t.days.map((d) => (
          <div key={d} className="text-center text-xs font-bold text-gray-500 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-8">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const status = getDayStatus(dateStr);
          const isFuture = dateStr > today;
          const isToday = dateStr === today;

          const bgMap = { full: "bg-yellow-100 border-yellow-400", half: "bg-purple-100 border-purple-400", low: "bg-blue-50 border-blue-300", empty: "bg-gray-50 border-gray-200" };

          return (
            <motion.div
              key={dateStr}
              whileHover={!isFuture ? { scale: 1.05 } : {}}
              className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-center p-1 ${isFuture ? "opacity-30" : bgMap[status]} ${isToday ? "ring-2 ring-purple-500" : ""}`}
            >
              <span className="text-xs font-bold text-gray-600">{format(day, "d")}</span>
              {!isFuture && <span className="text-base">{getDayEmoji(status)}</span>}
            </motion.div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { value: perfectDays, label: t.perfect, emoji: "⭐", color: "from-yellow-400 to-orange-400" },
          { value: longest, label: t.longestStreak, emoji: "🔥", color: "from-orange-400 to-red-500" },
          { value: `${completionPct}%`, label: t.completion, emoji: "🎯", color: "from-purple-400 to-pink-500" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`bg-gradient-to-br ${s.color} border-0 text-white shadow-lg`}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="text-3xl font-black">{s.value}</div>
                <div className="text-xs mt-1 opacity-90">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap justify-center mb-6 text-sm text-gray-600">
        <span>⭐ {language === "he" ? "מושלם" : "Perfect"}</span>
        <span>✨ {language === "he" ? "חצי" : "Half"}</span>
        <span>💫 {language === "he" ? "חלקי" : "Partial"}</span>
      </div>

      <Button onClick={handlePrint} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl py-3 font-bold">
        <Printer className="w-5 h-5 mr-2" />
        {t.print}
      </Button>
    </div>
  );
}