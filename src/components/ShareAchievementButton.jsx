import React, { useState } from 'react';
import { Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageContext';

// Creates a shareable image card for an achievement
export default function ShareAchievementButton({ childName, achievementTitle, achievementIcon, tokens, streak, variant = 'icon' }) {
  const { isRTL, language } = useLanguage();
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);

    const labels = {
      he: { title: 'הישג חדש!', tokens: 'אסימונים', streak: 'ימי רצף', share: 'שתף הישג' },
      en: { title: 'New Achievement!', tokens: 'tokens', streak: 'day streak', share: 'Share Achievement' },
      ru: { title: 'Новое достижение!', tokens: 'жетонов', streak: 'дней подряд', share: 'Поделиться' },
      ar: { title: 'إنجاز جديد!', tokens: 'رموز', streak: 'أيام متتالية', share: 'مشاركة' },
    };
    const tx = labels[language] || labels.he;

    // Build HTML for the card
    const html = `
      <html><body style="margin:0;background:#1a1a2e;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Arial,sans-serif">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:24px;padding:40px;text-align:center;width:340px;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
          <div style="font-size:80px;margin-bottom:16px">${achievementIcon || '⭐'}</div>
          <h1 style="color:#fff;font-size:24px;font-weight:900;margin:0 0 8px">${tx.title}</h1>
          <h2 style="color:#ffd700;font-size:20px;margin:0 0 20px">${childName}</h2>
          <div style="background:rgba(255,255,255,0.15);border-radius:16px;padding:16px;margin-bottom:20px">
            <p style="color:#fff;font-size:18px;font-weight:700;margin:0">${achievementTitle}</p>
          </div>
          <div style="display:flex;justify-content:center;gap:24px">
            ${tokens != null ? `<div style="text-align:center"><div style="color:#ffd700;font-size:28px;font-weight:900">🪙 ${tokens}</div><div style="color:rgba(255,255,255,0.7);font-size:13px">${tx.tokens}</div></div>` : ''}
            ${streak != null ? `<div style="text-align:center"><div style="color:#ff6b6b;font-size:28px;font-weight:900">🔥 ${streak}</div><div style="color:rgba(255,255,255,0.7);font-size:13px">${tx.streak}</div></div>` : ''}
          </div>
          <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:20px 0 0">כוכב המשימות ⭐</p>
        </div>
      </body></html>
    `;

    const text = `${tx.title}\n${childName}: ${achievementTitle} ${achievementIcon || '⭐'}\n${tokens != null ? `🪙 ${tokens} ${tx.tokens}` : ''} ${streak != null ? `🔥 ${streak} ${tx.streak}` : ''}\n\nכוכב המשימות - Task Star ⭐`;

    if (navigator.share) {
      try {
        await navigator.share({ title: tx.title, text });
      } catch (e) {
        // fallback: copy
        navigator.clipboard.writeText(text);
        alert(language === 'he' ? 'הועתק!' : 'Copied!');
      }
    } else {
      navigator.clipboard.writeText(text);
      alert(language === 'he' ? 'הטקסט הועתק ללוח!' : 'Text copied to clipboard!');
    }

    setSharing(false);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        disabled={sharing}
        className="p-2 rounded-full hover:bg-white/20 transition-colors"
        title={language === 'he' ? 'שתף' : 'Share'}
      >
        <Share2 className="w-4 h-4 text-white" />
      </button>
    );
  }

  return (
    <Button onClick={handleShare} disabled={sharing} variant="outline" size="sm" className="gap-2">
      <Share2 className="w-4 h-4" />
      {language === 'he' ? 'שתף' : language === 'ru' ? 'Поделиться' : language === 'ar' ? 'مشاركة' : 'Share'}
    </Button>
  );
}