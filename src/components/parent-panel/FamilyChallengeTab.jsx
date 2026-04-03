import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageContext";
import { Trash2, Plus } from "lucide-react";

export default function FamilyChallengeTab({ familyId }) {
  const { isRTL } = useLanguage();
  const [challenges, setChallenges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", reward_description: "",
    target_type: "task_count", target_value: 50,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  });

  useEffect(() => { if (familyId) load(); }, [familyId]);

  const load = async () => {
    const data = await base44.entities.FamilyChallenge.filter({ family_id: familyId });
    setChallenges(data.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0)));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await base44.entities.FamilyChallenge.create({ ...form, family_id: familyId, current_value: 0, is_completed: false, is_active: true });
    setShowForm(false);
    setForm({ title: "", description: "", reward_description: "", target_type: "task_count", target_value: 50, start_date: new Date().toISOString().split("T")[0], end_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0] });
    await load();
  };

  const handleDelete = async id => {
    if (window.confirm(isRTL ? "למחוק את האתגר?" : "Delete challenge?")) {
      await base44.entities.FamilyChallenge.delete(id);
      await load();
    }
  };

  const handleToggle = async (challenge) => {
    await base44.entities.FamilyChallenge.update(challenge.id, { is_active: !challenge.is_active });
    await load();
  };

  const TARGET_TYPES = [
    { value: "task_count", label: isRTL ? "סה\"כ X משימות" : "Total X tasks" },
    { value: "all_tasks", label: isRTL ? "כולם מסיימים הכל" : "Everyone finishes all" },
    { value: "streak", label: isRTL ? "שמירת סטריק" : "Maintain streak" },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">🏆 {isRTL ? "אתגרים משפחתיים" : "Family Challenges"}</h3>
          <p className="text-gray-500 text-sm">{isRTL ? "צרו אתגרים שכל המשפחה עובדת עליהם יחד" : "Create challenges the whole family works on together"}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-purple-500 to-pink-600">
          <Plus className="w-4 h-4 mr-1" /> {isRTL ? "אתגר חדש" : "New Challenge"}
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? "שם האתגר" : "Challenge Name"}</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={isRTL ? "שבוע הכוכבים ⭐" : "Star Week ⭐"} required />
              </div>
              <div>
                <Label>{isRTL ? "הפרס המשפחתי 🎁" : "Family Reward 🎁"}</Label>
                <Input value={form.reward_description} onChange={e => setForm(f => ({ ...f, reward_description: e.target.value }))} placeholder={isRTL ? "פיצה משפחתית!" : "Family pizza!"} />
              </div>
            </div>

            <div>
              <Label>{isRTL ? "תיאור" : "Description"}</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>{isRTL ? "סוג יעד" : "Target Type"}</Label>
                <Select value={form.target_type} onValueChange={v => setForm(f => ({ ...f, target_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TARGET_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {form.target_type !== "all_tasks" && (
                <div>
                  <Label>{isRTL ? "ערך יעד" : "Target Value"}</Label>
                  <Input type="number" min="1" value={form.target_value} onChange={e => setForm(f => ({ ...f, target_value: Number(e.target.value) }))} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isRTL ? "תאריך התחלה" : "Start Date"}</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <Label>{isRTL ? "תאריך סיום" : "End Date"}</Label>
                <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{isRTL ? "ביטול" : "Cancel"}</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">{isRTL ? "צור אתגר" : "Create Challenge"}</Button>
            </div>
          </form>
        </motion.div>
      )}

      {challenges.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-12 text-center">
            <p className="text-5xl mb-3">🏆</p>
            <p className="text-gray-500">{isRTL ? "עדיין אין אתגרים משפחתיים" : "No family challenges yet"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {challenges.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className={`border-2 ${c.is_active ? "border-purple-200" : "border-gray-200 opacity-60"}`}>
                <CardContent className="p-4">
                  <div className={`flex items-start justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="flex-1">
                      <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <h4 className="font-bold text-gray-800">{c.title}</h4>
                        {c.is_completed && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ {isRTL ? "הושלם" : "Done"}</span>}
                        {c.is_active && !c.is_completed && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{isRTL ? "פעיל" : "Active"}</span>}
                      </div>
                      {c.reward_description && <p className="text-sm text-gray-600 mt-0.5">🎁 {c.reward_description}</p>}
                      <div className="mt-2 bg-gray-100 rounded-full h-2 w-full">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(100, ((c.current_value || 0) / (c.target_value || 1)) * 100)}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{c.current_value || 0} / {c.target_value}</p>
                    </div>
                    <div className={`flex gap-2 flex-shrink-0 ${isRTL ? "mr-3" : "ml-3"}`}>
                      <Button variant="outline" size="sm" onClick={() => handleToggle(c)}>
                        {c.is_active ? (isRTL ? "השבת" : "Pause") : (isRTL ? "הפעל" : "Activate")}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}