import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Check, Trash2, Calendar, User, 
  AlertCircle, CheckCircle2, Clock, ArrowRight 
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function AdultTodoList({ profile, children, onTaskComplete }) {
  const { t, isRTL } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    category: 'other',
    assigned_to_profile_id: profile.id,
    tokens_reward: 0
  });

  useEffect(() => {
    loadTasks();
  }, [profile.id]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const allTasks = await base44.entities.HouseholdTask.filter({
        assigned_to_profile_id: profile.id,
        family_id: profile.family_id
      }, '-due_date');
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!formData.title.trim()) return;

    try {
      await base44.entities.HouseholdTask.create({
        ...formData,
        family_id: profile.family_id
      });
      
      setFormData({
        title: '',
        description: '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        category: 'other',
        assigned_to_profile_id: profile.id,
        tokens_reward: 0
      });
      setShowAddForm(false);
      await loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      await base44.entities.HouseholdTask.update(task.id, {
        is_completed: true,
        completed_date: new Date().toISOString()
      });
      await loadTasks();
      if (onTaskComplete) onTaskComplete();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await base44.entities.HouseholdTask.delete(taskId);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleAssignToChild = async (task, childId) => {
    try {
      await base44.entities.HouseholdTask.update(task.id, {
        assigned_to_profile_id: childId,
        assigned_by: profile.name
      });
      await loadTasks();
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  const priorityColors = {
    low: 'border-blue-300 bg-blue-50',
    medium: 'border-yellow-300 bg-yellow-50',
    high: 'border-red-300 bg-red-50'
  };

  const priorityIcons = {
    low: <Clock className="w-4 h-4 text-blue-600" />,
    medium: <AlertCircle className="w-4 h-4 text-yellow-600" />,
    high: <AlertCircle className="w-4 h-4 text-red-600" />
  };

  const activeTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            רשימת מטלות - {profile.name}
          </h2>
          <p className="text-gray-600">
            {activeTasks.length} משימות פעילות
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          משימה חדשה
        </Button>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6 bg-purple-50 border-2 border-purple-200">
              <div className="space-y-4">
                <Input
                  placeholder="שם המשימה..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Textarea
                  placeholder="תיאור (אופציונלי)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">תאריך יעד</label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">עדיפות</label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">נמוכה</SelectItem>
                        <SelectItem value="medium">בינונית</SelectItem>
                        <SelectItem value="high">גבוהה</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">קטגוריה</label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">אישי</SelectItem>
                        <SelectItem value="work">עבודה</SelectItem>
                        <SelectItem value="shopping">קניות</SelectItem>
                        <SelectItem value="cleaning">ניקיון</SelectItem>
                        <SelectItem value="cooking">בישול</SelectItem>
                        <SelectItem value="other">אחר</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleAddTask} className="flex-1">
                    הוסף משימה
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline">
                    ביטול
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Tasks */}
      <div className="space-y-3">
        {activeTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`p-4 border-l-4 ${priorityColors[task.priority]}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {priorityIcons[task.priority]}
                    <h3 className="font-bold text-gray-800">{task.title}</h3>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.due_date).toLocaleDateString('he-IL')}
                    </div>
                    <div className="px-2 py-1 bg-white rounded">
                      {task.category === 'personal' ? 'אישי' :
                       task.category === 'work' ? 'עבודה' :
                       task.category === 'shopping' ? 'קניות' :
                       task.category === 'cleaning' ? 'ניקיון' :
                       task.category === 'cooking' ? 'בישול' : 'אחר'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleCompleteTask(task)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  {children && children.length > 0 && (
                    <Select onValueChange={(childId) => handleAssignToChild(task, childId)}>
                      <SelectTrigger className="h-8 w-8 p-0">
                        <ArrowRight className="w-4 h-4" />
                      </SelectTrigger>
                      <SelectContent>
                        {children.filter(c => !c.is_adult).map(child => (
                          <SelectItem key={child.id} value={child.id}>
                            העבר ל-{child.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {activeTasks.length === 0 && !showAddForm && (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-600 mb-2">כל המשימות הושלמו!</h3>
          <p className="text-gray-500">הוסף משימות חדשות כדי להמשיך</p>
        </Card>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-600">הושלמו ({completedTasks.length})</h3>
          {completedTasks.slice(0, 5).map((task) => (
            <Card key={task.id} className="p-3 opacity-50 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="line-through text-gray-600">{task.title}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}