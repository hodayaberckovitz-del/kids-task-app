import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';

// Small indicator showing remaining screen time
export default function ScreenTimeIndicator({ profile }) {
  const { language } = useLanguage();
  const [minutesLeft, setMinutesLeft] = useState(null);

  useEffect(() => {
    if (!profile || !profile.daily_screen_time_minutes || profile.daily_screen_time_minutes === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const key = `screen_time_${profile.id}_${today}`;
    const used = parseFloat(localStorage.getItem(key) || '0');
    const left = Math.max(0, profile.daily_screen_time_minutes - Math.floor(used));
    setMinutesLeft(left);

    const interval = setInterval(() => {
      const usedNow = parseFloat(localStorage.getItem(key) || '0');
      setMinutesLeft(Math.max(0, profile.daily_screen_time_minutes - Math.floor(usedNow)));
    }, 60000);

    return () => clearInterval(interval);
  }, [profile?.id]);

  if (minutesLeft === null) return null;

  const label = {
    he: `⏱️ ${minutesLeft} דק' מסך`,
    en: `⏱️ ${minutesLeft}m screen`,
    ru: `⏱️ ${minutesLeft} мин`,
    ar: `⏱️ ${minutesLeft} دق`,
  }[language] || `⏱️ ${minutesLeft}m`;

  const pct = profile.daily_screen_time_minutes > 0
    ? Math.min(100, 100 - (minutesLeft / profile.daily_screen_time_minutes) * 100)
    : 0;

  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow text-xs font-semibold">
      <div className="relative w-6 h-6">
        <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle
            cx="12" cy="12" r="10" fill="none"
            stroke={minutesLeft < 10 ? '#ef4444' : '#10b981'}
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 10}`}
            strokeDashoffset={`${2 * Math.PI * 10 * (1 - pct / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
      </div>
      <span className={minutesLeft < 10 ? 'text-red-600' : 'text-gray-700'}>{label}</span>
    </div>
  );
}