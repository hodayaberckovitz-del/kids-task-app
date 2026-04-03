import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Plus, Train, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';

export default function RoutineManagementTab({ childProfiles, tasks, selectedChildId }) {
  const [routines, setRoutines] = useState([]);
  const [localChildId, setLocalChildId] = useState(selectedChildId || childProfiles[0]?.id);
  const [routineType, setRoutineType] = useState('morning');
  const [bonusTokens, setBonusTokens] = useState(3);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const { isRTL } = useLanguage();

  const childTasks = tasks.filter(t =>
    t.is_active &&
    (!t.child_profile_id || t.child_profile_id === localChildId) &&
    (routineType === 'morning' ? t.task_type === 'morning' : t.task_type === 'evening')
  );

  useEffect(() => {
    if (!localChildId) return;
    loadRoutines();
  }, [localChildId, routineType]);

  const loadRoutines = async () => {
    const profile = childProfiles.find(c => c.id === localChildId);
    if (!profile) return;
    const data = await base44.entities.Routine.filter({
      child_profile_id: localChildId,
      family_id: profile.family_id,
      routine_type: routineType
    });
    setRoutines(data);
    if (data.length > 0) {
      setSelectedTaskIds(data[0].steps || []);
      setBonusTokens(data[0].bonus_tokens || 3);
    } else {
      setSelectedTaskIds([]);
    }
  };

  const toggleTask = (taskId) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSave = async () => {
    const profile = childProfiles.find(c => c.id === localChildId);
    if (!profile) return;
    setSaving(true);
    try {
      const data = {
        child_profile_id: localChildId,
        family_id: profile.family_id,
        routine_type: routineType,
        steps: selectedTaskIds,
        bonus_tokens: bonusTokens
      };
      if (routines.length > 0) {
        await base44.entities.Routine.update(routines[0].id, data);
      } else {
        await base44.entities.Routine.create(data);
      }
      toast.success(isRTL ? 'שגרה נשמרה ✓' : 'Routine saved ✓');
      await loadRoutines();
    } catch (err) {
      toast.error(isRTL ? 'שגיאה' : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (routines.length > 0) {
      await base44.entities.Routine.delete(routines[0].id);
      setSelectedTaskIds([]);
      setRoutines([]);
      toast.success(isRTL ? 'שגרה נמחקה' : 'Routine deleted');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Train className="w-6 h-6 text-blue-600" />
          {isRTL ? 'ניהול שגרות' : 'Routine Management'}
        </h2>
        <p className="text-gray-500 text-sm">{isRTL ? 'הגדר סדר משימות לשגרת בוקר/ערב עם בונוס' : 'Set task order for morning/evening routine with bonus'}</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={localChildId} onValueChange={setLocalChildId}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {childProfiles.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setRoutineType('morning')}
            className={`px-4 py-2 text-sm font-bold transition-colors ${routineType === 'morning' ? 'bg-yellow-500 text-white' : 'hover:bg-gray-50'}`}
          >
            ☀️ {isRTL ? 'בוקר' : 'Morning'}
          </button>
          <button
            onClick={() => setRoutineType('evening')}
            className={`px-4 py-2 text-sm font-bold transition-colors ${routineType === 'evening' ? 'bg-indigo-500 text-white' : 'hover:bg-gray-50'}`}
          >
            🌙 {isRTL ? 'ערב' : 'Evening'}
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{isRTL ? 'בחר משימות לשגרה' : 'Select tasks for routine'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {childTasks.length === 0 && (
            <p className="text-gray-500 text-sm py-4 text-center">
              {isRTL ? 'אין משימות בוקר/ערב לילד זה' : 'No morning/evening tasks for this child'}
            </p>
          )}
          {childTasks.map(task => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                selectedTaskIds.includes(task.id)
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedTaskIds.includes(task.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}>
                {selectedTaskIds.includes(task.id) && <span className="text-white text-xs">✓</span>}
              </div>
              <span className="text-lg">{task.icon || '⭐'}</span>
              <span className="font-medium text-gray-800">{task.title}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <label className="text-sm font-bold text-gray-700">{isRTL ? '🎁 בונוס על שגרה מלאה:' : '🎁 Bonus tokens for full routine:'}</label>
        <Input
          type="number"
          min="1"
          max="20"
          value={bonusTokens}
          onChange={e => setBonusTokens(Number(e.target.value))}
          className="w-20"
        />
        <span className="text-sm text-gray-500">{isRTL ? 'אסימונים' : 'tokens'}</span>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving || selectedTaskIds.length === 0} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600">
          {saving ? '...' : <><Plus className="w-4 h-4 mr-1" /> {isRTL ? 'שמור שגרה' : 'Save Routine'}</>}
        </Button>
        {routines.length > 0 && (
          <Button onClick={handleDelete} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}