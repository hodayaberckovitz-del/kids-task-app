import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bell, Save } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';

export default function NotificationSettingsPanel({ childProfiles, familyId }) {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const { isRTL } = useLanguage();

  useEffect(() => {
    if (!familyId) return;
    loadSettings();
  }, [familyId]);

  const loadSettings = async () => {
    const data = await base44.entities.NotificationSettings.filter({ family_id: familyId });
    if (data.length > 0) {
      setSettings(data[0]);
    } else {
      setSettings({
        family_id: familyId,
        morning_reminder_time: '07:00',
        evening_reminder_time: '19:00',
        parent_completion_notify: true,
        streak_reminder: true,
        is_active: true
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settings.id) {
        await base44.entities.NotificationSettings.update(settings.id, settings);
      } else {
        const created = await base44.entities.NotificationSettings.create(settings);
        setSettings(created);
      }
      toast.success(isRTL ? 'הגדרות נשמרו ✓' : 'Settings saved ✓');
    } catch (e) {
      toast.error(isRTL ? 'שגיאה' : 'Error');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="py-8 text-center text-gray-400">{isRTL ? 'טוען...' : 'Loading...'}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-800">{isRTL ? 'הגדרות התראות' : 'Notification Settings'}</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{isRTL ? 'שעות תזכורות' : 'Reminder Times'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 w-36">{isRTL ? '☀️ תזכורת בוקר' : '☀️ Morning reminder'}</label>
            <Input
              type="time"
              value={settings.morning_reminder_time || '07:00'}
              onChange={e => setSettings(s => ({ ...s, morning_reminder_time: e.target.value }))}
              className="w-32"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 w-36">{isRTL ? '🌙 תזכורת ערב' : '🌙 Evening reminder'}</label>
            <Input
              type="time"
              value={settings.evening_reminder_time || '19:00'}
              onChange={e => setSettings(s => ({ ...s, evening_reminder_time: e.target.value }))}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.parent_completion_notify ?? true}
              onChange={e => setSettings(s => ({ ...s, parent_completion_notify: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">{isRTL ? 'קבל התראה כשהילד מסיים משימה' : 'Notify when child completes a task'}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.streak_reminder ?? true}
              onChange={e => setSettings(s => ({ ...s, streak_reminder: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">{isRTL ? 'שלח תזכורת שמירת רצף' : 'Send streak reminder'}</span>
          </label>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
        <Save className="w-4 h-4 mr-2" />
        {saving ? (isRTL ? 'שומר...' : 'Saving...') : (isRTL ? 'שמור הגדרות' : 'Save Settings')}
      </Button>
    </div>
  );
}