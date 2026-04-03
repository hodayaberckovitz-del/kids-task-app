import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageContext";
import { motion } from "framer-motion";

export default function WhatsAppConfigTab({ childProfiles = [], familyId }) {
  const { isRTL } = useLanguage();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    parent_phone: "",
    is_active: false,
    daily_summary_time: "20:00",
    morning_reminder_time: "07:30",
    evening_reminder_time: "19:00",
    send_task_reminders: true,
    send_completion_notifications: true,
    whatsapp_webhook_url: "",
    child_phones: {}
  });

  useEffect(() => {
    loadConfig();
  }, [familyId]);

  const loadConfig = async () => {
    if (!familyId) return;
    const configs = await base44.entities.WhatsAppConfig.filter({ family_id: familyId });
    if (configs.length > 0) {
      const c = configs[0];
      setConfig(c);
      setForm({
        parent_phone: c.parent_phone || "",
        is_active: c.is_active || false,
        daily_summary_time: c.daily_summary_time || "20:00",
        morning_reminder_time: c.morning_reminder_time || "07:30",
        evening_reminder_time: c.evening_reminder_time || "19:00",
        send_task_reminders: c.send_task_reminders !== false,
        send_completion_notifications: c.send_completion_notifications !== false,
        whatsapp_webhook_url: c.whatsapp_webhook_url || "",
        child_phones: c.child_phones || {}
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form, family_id: familyId };
      if (config) {
        await base44.entities.WhatsAppConfig.update(config.id, data);
      } else {
        await base44.entities.WhatsAppConfig.create(data);
      }
      await loadConfig();
      alert(isRTL ? "הגדרות נשמרו!" : "Settings saved!");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const setChildPhone = (childId, phone) => {
    setForm(prev => ({ ...prev, child_phones: { ...prev.child_phones, [childId]: phone } }));
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h3 className="text-2xl font-bold text-gray-800">📱 {isRTL ? "הגדרות WhatsApp" : "WhatsApp Settings"}</h3>
        <p className="text-gray-500 text-sm mt-1">
          {isRTL ? "חבר שירות WhatsApp לתזכורות ועדכונים" : "Connect WhatsApp for reminders and updates"}
        </p>
      </div>

      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <p className="text-sm text-green-800 font-medium">
            💡 {isRTL
              ? "השתמש בשירות כמו Green API, Twilio, או UltraMsg. הדבק את ה-webhook URL שלהם למטה."
              : "Use a service like Green API, Twilio, or UltraMsg. Paste their webhook URL below."}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <Label>{isRTL ? "Webhook URL" : "Webhook URL"}</Label>
          <Input
            value={form.whatsapp_webhook_url}
            onChange={e => setForm(f => ({ ...f, whatsapp_webhook_url: e.target.value }))}
            placeholder="https://api.green-api.com/..."
            dir="ltr"
          />
        </div>

        <div>
          <Label>{isRTL ? "טלפון הורה" : "Parent Phone"}</Label>
          <Input
            value={form.parent_phone}
            onChange={e => setForm(f => ({ ...f, parent_phone: e.target.value }))}
            placeholder="+972501234567"
            dir="ltr"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>{isRTL ? "שעת סיכום יומי" : "Daily Summary"}</Label>
            <Input type="time" value={form.daily_summary_time} onChange={e => setForm(f => ({ ...f, daily_summary_time: e.target.value }))} />
          </div>
          <div>
            <Label>{isRTL ? "תזכורת בוקר" : "Morning Reminder"}</Label>
            <Input type="time" value={form.morning_reminder_time} onChange={e => setForm(f => ({ ...f, morning_reminder_time: e.target.value }))} />
          </div>
          <div>
            <Label>{isRTL ? "תזכורת ערב" : "Evening Reminder"}</Label>
            <Input type="time" value={form.evening_reminder_time} onChange={e => setForm(f => ({ ...f, evening_reminder_time: e.target.value }))} />
          </div>
        </div>

        <div className="space-y-2">
          {[
            { key: "send_completion_notifications", label: isRTL ? "הודעה להורה על השלמת משימה" : "Notify parent on task completion" },
            { key: "send_task_reminders", label: isRTL ? "תזכורות לילדים" : "Reminders to children" },
            { key: "is_active", label: isRTL ? "הפעל שירות WhatsApp" : "Enable WhatsApp service" },
          ].map(({ key, label }) => (
            <label key={key} className={`flex items-center gap-3 p-3 bg-white rounded-xl border cursor-pointer ${isRTL ? "flex-row-reverse" : ""}`}>
              <input
                type="checkbox"
                checked={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                className="w-5 h-5 accent-green-500"
              />
              <span className="font-medium">{label}</span>
            </label>
          ))}
        </div>

        {childProfiles.filter(c => !c.is_adult).length > 0 && (
          <div>
            <Label className="text-base font-bold">{isRTL ? "טלפוני ילדים" : "Children Phones"}</Label>
            <div className="space-y-2 mt-2">
              {childProfiles.filter(c => !c.is_adult).map(child => (
                <div key={child.id} className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="w-24 font-medium text-sm truncate">{child.name}</span>
                  <Input
                    value={form.child_phones[child.id] || ""}
                    onChange={e => setChildPhone(child.id, e.target.value)}
                    placeholder="+972501234567"
                    dir="ltr"
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full bg-green-600 hover:bg-green-700">
          {saving ? (isRTL ? "שומר..." : "Saving...") : (isRTL ? "שמור הגדרות" : "Save Settings")}
        </Button>
      </div>
    </div>
  );
}