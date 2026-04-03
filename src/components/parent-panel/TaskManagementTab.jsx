import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Plus, Upload, Sparkles, GripVertical, RotateCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Icon from '../shared/Icon';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner'; // Added for toast notifications

// Icon list with translations
const ICON_LIST = [
  'Smile', 'Star', 'Heart', 'Coffee', 'Book', 'Music', 'Sun', 'Moon',
  'Cloud', 'Zap', 'Award', 'Target', 'TrendingUp', 'CheckCircle',
  'Sparkles', 'Gift', 'Crown', 'Rocket', 'Lightbulb', 'Flame',
  'Apple', 'Pizza', 'IceCream', 'Cookie', 'Candy', 'Cherry',
  'ShoppingCart', 'Home', 'Bed', 'Bath', 'Shirt', 'Scissors',
  'Brush', 'Palette', 'PenTool', 'Clipboard', 'FileText', 'BookOpen',
  'GraduationCap', 'Briefcase', 'Users', 'User', 'Baby', 'UserPlus',
  'Activity', 'Droplet', 'Wind', 'Umbrella', 'Sunrise', 'Sunset',
  'Timer', 'Clock', 'Calendar', 'Bell', 'Volume2', 'Music2',
  'Headphones', 'Camera', 'Video', 'Tv', 'Smartphone', 'Monitor',
  'Key', 'Lock', 'Unlock', 'Shield', 'Eye', 'EyeOff',
  'ThumbsUp', 'MessageCircle', 'Send', 'Mail', 'Phone'
];

// Icon translations
const ICON_NAMES = {
  he: {
    Smile: 'חיוך', Star: 'כוכב', Heart: 'לב', Coffee: 'קפה', Book: 'ספר', Music: 'מוזיקה', Sun: 'שמש', Moon: 'ירח',
    Cloud: 'ענן', Zap: 'ברק', Award: 'פרס', Target: 'מטרה', TrendingUp: 'עולה', CheckCircle: 'סימון',
    Sparkles: 'ניצוצות', Gift: 'מתנה', Crown: 'כתר', Rocket: 'רקטה', Lightbulb: 'נורה', Flame: 'להבה',
    Apple: 'תפוח', Pizza: 'פיצה', IceCream: 'גלידה', Cookie: 'עוגייה', Candy: 'ממתק', Cherry: 'דובדבן',
    ShoppingCart: 'עגלה', Home: 'בית', Bed: 'מיטה', Bath: 'אמבטיה', Shirt: 'חולצה', Scissors: 'מספריים',
    Brush: 'מברשת', Palette: 'פלטה', PenTool: 'עט', Clipboard: 'לוח', FileText: 'קובץ', BookOpen: 'ספר פתוח',
    GraduationCap: 'כובע סיום', Briefcase: 'תיק', Users: 'משתמשים', User: 'משתמש', Baby: 'תינוק', UserPlus: 'הוסף משתמש',
    Activity: 'פעילות', Droplet: 'טיפה', Wind: 'רוח', Umbrella: 'מטריה', Sunrise: 'זריחה', Sunset: 'שקיעה',
    Timer: 'שעון עצר', Clock: 'שעון', Calendar: 'לוח שנה', Bell: 'פעמון', Volume2: 'עוצמה', Music2: 'מוזיקה',
    Headphones: 'אוזניות', Camera: 'מצלמה', Video: 'וידאו', Tv: 'טלוויזיה', Smartphone: 'סמארטפון', Monitor: 'מסך',
    Key: 'מפתח', Lock: 'נעול', Unlock: 'פתוח', Shield: 'מגן', Eye: 'עין', EyeOff: 'עין סגורה',
    ThumbsUp: 'אגודל למעלה', MessageCircle: 'הודעה', Send: 'שלח', Mail: 'דואר', Phone: 'טלפון'
  },
  en: {
    Smile: 'Smile', Star: 'Star', Heart: 'Heart', Coffee: 'Coffee', Book: 'Book', Music: 'Music', Sun: 'Sun', Moon: 'Moon',
    Cloud: 'Cloud', Zap: 'Lightning', Award: 'Award', Target: 'Target', TrendingUp: 'Trending', CheckCircle: 'Check',
    Sparkles: 'Sparkles', Gift: 'Gift', Crown: 'Crown', Rocket: 'Rocket', Lightbulb: 'Lightbulb', Flame: 'Flame',
    Apple: 'Apple', Pizza: 'Pizza', IceCream: 'Ice Cream', Cookie: 'Cookie', Candy: 'Candy', Cherry: 'Cherry',
    ShoppingCart: 'Shopping', Home: 'Home', Bed: 'Bed', Bath: 'Bath', Shirt: 'Shirt', Scissors: 'Scissors',
    Brush: 'Brush', Palette: 'Palette', PenTool: 'Pen', Clipboard: 'Clipboard', FileText: 'File', BookOpen: 'Book Open',
    GraduationCap: 'Graduation', Briefcase: 'Briefcase', Users: 'Users', User: 'User', Baby: 'Baby', UserPlus: 'Add User',
    Activity: 'Activity', Droplet: 'Droplet', Wind: 'Wind', Umbrella: 'Umbrella', Sunrise: 'Sunrise', Sunset: 'Sunset',
    Timer: 'Timer', Clock: 'Clock', Calendar: 'Calendar', Bell: 'Bell', Volume2: 'Volume', Music2: 'Music',
    Headphones: 'Headphones', Camera: 'Camera', Video: 'Video', Tv: 'TV', Smartphone: 'Phone', Monitor: 'Monitor',
    Key: 'Key', Lock: 'Lock', Unlock: 'Unlock', Shield: 'Shield', Eye: 'Eye', EyeOff: 'Eye Off',
    ThumbsUp: 'Thumbs Up', MessageCircle: 'Message', Send: 'Send', Mail: 'Mail', Phone: 'Phone'
  },
  ru: {
    Smile: 'Улыбка', Star: 'Звезда', Heart: 'Сердце', Coffee: 'Кофе', Book: 'Книга', Music: 'Музыка', Sun: 'Солнце', Moon: 'Луна',
    Cloud: 'Облако', Zap: 'Молния', Award: 'Награда', Target: 'Цель', TrendingUp: 'Рост', CheckCircle: 'Галочка',
    Sparkles: 'Искры', Gift: 'Подарок', Crown: 'Корона', Rocket: 'Ракета', Lightbulb: 'Лампочка', Flame: 'Пламя',
    Apple: 'Яблоко', Pizza: 'Пицца', IceCream: 'Мороженое', Cookie: 'Печенье', Candy: 'Конфета', Cherry: 'Вишня',
    ShoppingCart: 'Корзина', Home: 'Дом', Bed: 'Кровать', Bath: 'Ванна', Shirt: 'Рубашка', Scissors: 'Ножницы',
    Brush: 'Кисть', Palette: 'Палитра', PenTool: 'Ручка', Clipboard: 'Буфер', FileText: 'Файл', BookOpen: 'Книга открыта',
    GraduationCap: 'Выпускной', Briefcase: 'Портфель', Users: 'Пользователи', User: 'Пользователь', Baby: 'Ребенок', UserPlus: 'Добавить',
    Activity: 'Активность', Droplet: 'Капля', Wind: 'Ветер', Umbrella: 'Зонт', Sunrise: 'Восход', Sunset: 'Закат',
    Timer: 'Таймер', Clock: 'Часы', Calendar: 'Календарь', Bell: 'Звонок', Volume2: 'Громкость', Music2: 'Музыка',
    Headphones: 'Наушники', Camera: 'Камера', Video: 'Видео', Tv: 'ТВ', Smartphone: 'Смартфон', Monitor: 'Монитор',
    Key: 'Ключ', Lock: 'Замок', Unlock: 'Открыто', Shield: 'Щит', Eye: 'Глаз', EyeOff: 'Глаз закрыт',
    ThumbsUp: 'Большой палец', MessageCircle: 'Сообщение', Send: 'Отправить', Mail: 'Почта', Phone: 'Телефон'
  },
  ar: {
    Smile: 'ابتسامة', Star: 'نجمة', Heart: 'قلب', Coffee: 'قهوة', Book: 'كتاب', Music: 'موسيقى', Sun: 'شمس', Moon: 'قمر',
    Cloud: 'سحابة', Zap: 'برق', Award: 'جائزة', Target: 'هدف', TrendingUp: 'ارتفاع', CheckCircle: 'علامة',
    Sparkles: 'شرارات', Gift: 'هدية', Crown: 'تاج', Rocket: 'صاروخ', Lightbulb: 'مصباح', Flame: 'لهب',
    Apple: 'تفاحة', Pizza: 'بيتزا', IceCream: 'آيس كريم', Cookie: 'كعكة', Candy: 'حلوى', Cherry: 'كرز',
    ShoppingCart: 'عربة', Home: 'منزل', Bed: 'سرير', Bath: 'حمام', Shirt: 'قميص', Scissors: 'مقص',
    Brush: 'فرشاة', Palette: 'لوحة', PenTool: 'قلم', Clipboard: 'حافظة', FileText: 'ملف', BookOpen: 'كتاب مفتوح',
    GraduationCap: 'تخرج', Briefcase: 'حقيبة', Users: 'مستخدمون', User: 'مستخدم', Baby: 'طفل', UserPlus: 'إضافة مستخدم',
    Activity: 'نشاط', Droplet: 'قطرة', Wind: 'رياح', Umbrella: 'مظلة', Sunrise: 'شروق', Sunset: 'غروب',
    Timer: 'مؤقت', Clock: 'ساعة', Calendar: 'تقويم', Bell: 'جرس', Volume2: 'صوت', Music2: 'موسيقى',
    Headphones: 'سماعات', Camera: 'كاميرا', Video: 'فيديو', Tv: 'تلفاز', Smartphone: 'هاتف', Monitor: 'شاشة',
    Key: 'مفتاح', Lock: 'قفل', Unlock: 'مفتوح', Shield: 'درع', Eye: 'عين', EyeOff: 'عين مغلقة',
    ThumbsUp: 'إعجاب', MessageCircle: 'رسالة', Send: 'إرسال', Mail: 'بريد', Phone: 'هاتف'
  }
};

const COLOR_LIST = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
  '#6366F1', '#A855F7', '#D946EF', '#F43F5E', '#22C55E'
];

export default function TaskManagementTab({ tasks = [], onTaskAdded, onTaskDeleted, childProfiles = [], selectedChildId }) {
  const { t, language } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [completedToday, setCompletedToday] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Star',
    color: '#3B82F6',
    task_type: 'morning',
    base_tokens: 1,
    star_tokens: 15,
    timed_tokens: 10,
    duration_minutes: 15,
    input_type: 'checkbox',
    input_label: '',
    visual_image_url: '',
    is_active: true,
    order: 0,
    child_profile_id: '',
    is_shared: false,
    shared_child_ids: []
  });

  const profiles = Array.isArray(childProfiles) ? childProfiles : [];
  const tasksList = Array.isArray(tasks) ? tasks : [];

  useEffect(() => {
    if (selectedChildId && !formData.child_profile_id) {
      setFormData(prev => ({ ...prev, child_profile_id: selectedChildId }));
    }
  }, [selectedChildId]);

  useEffect(() => {
    if (selectedChildId) {
      loadCompletedTasks();
    } else {
      setCompletedToday([]);
    }
  }, [selectedChildId]);

  const loadCompletedTasks = async () => {
    if (!selectedChildId) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const completions = await base44.entities.TaskCompletion.filter({
        child_profile_id: selectedChildId,
        completed_date: today
      });
      setCompletedToday(completions);
    } catch (error) {
      console.error('Error loading completed tasks:', error);
    }
  };

  const filteredTasks = selectedChildId
    ? tasksList.filter(task => task.child_profile_id === selectedChildId)
    : tasksList;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      icon: task.icon || 'Star',
      color: task.color || '#3B82F6',
      task_type: task.task_type || 'morning',
      base_tokens: task.base_tokens || 1,
      star_tokens: task.star_tokens || 15,
      timed_tokens: task.timed_tokens || 10,
      duration_minutes: task.duration_minutes || 15,
      input_type: task.input_type || 'checkbox',
      input_label: task.input_label || '',
      visual_image_url: task.visual_image_url || '',
      is_active: task.is_active !== undefined ? task.is_active : true,
      order: task.order || 0,
      child_profile_id: task.child_profile_id || selectedChildId || '',
      is_shared: task.is_shared || false,
      shared_child_ids: task.shared_child_ids || []
    });
    setShowForm(true);
    setShowAIPrompt(false);
    setAiPrompt('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleInputChange('visual_image_url', file_url);
      setShowAIPrompt(false);
      setAiPrompt('');
    } catch (error) {
      console.error(t('errorUploadingImage'), error);
      alert(t('errorUploadingImage'));
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateImage = async () => {
    const promptText = aiPrompt.trim() || formData.title || '';
    
    if (!promptText) {
      alert(language === 'he' ? 'אנא הזן תיאור לתמונה' : 
            language === 'en' ? 'Please enter a description' :
            language === 'ru' ? 'Пожалуйста, введите описание' :
            'الرجاء إدخال وصف');
      return;
    }

    try {
      setGeneratingImage(true);
      
      const finalPrompt = `Cute cartoon illustration for children showing: ${promptText}

Art style: bright vibrant colors, simple clean design, friendly cartoon style,
cheerful and positive mood, clear subject, professional children's book illustration,
suitable for ages 3-12, educational and friendly, high resolution 4K.

Make it CLEAR and SIMPLE - children should easily understand what they see.
The image should be inviting and fun for kids.`;
      
      console.log('Generating task image with prompt:', finalPrompt);
      
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: finalPrompt
      });
      
      console.log('Image generated successfully:', url);
      handleInputChange('visual_image_url', url);
      setShowAIPrompt(false);
      setAiPrompt('');
      toast.success(t('imageUploadedSuccess') || 'Image created successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      alert((language === 'he' ? 'שגיאה ביצירת התמונה: ' : 'Error creating image: ') + (error.message || ''));
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.child_profile_id) {
        alert(t('pleaseCreateProfile') || 'Please select a child profile');
        return;
      }

      const user = await base44.auth.me();
      const selectedProfile = profiles.find(p => p.id === formData.child_profile_id);

      const familyId = selectedProfile?.family_id || user?.family_id;

      if (!familyId) {
        console.error('Missing family_id:', { user, selectedProfile });
        alert(t('errorSavingTask') + ': Missing family_id. Please refresh and try again.');
        return;
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        task_type: formData.task_type,
        base_tokens: Number(formData.base_tokens),
        star_tokens: Number(formData.star_tokens),
        timed_tokens: Number(formData.timed_tokens),
        duration_minutes: Number(formData.duration_minutes),
        input_type: formData.input_type,
        input_label: formData.input_label,
        visual_image_url: formData.visual_image_url,
        is_active: formData.is_active,
        order: Number(formData.order),
        language: profiles.find(c => c.id === formData.child_profile_id)?.language || language,
        child_profile_id: formData.child_profile_id,
        family_id: familyId,
        is_shared: formData.is_shared,
        shared_child_ids: formData.is_shared ? formData.shared_child_ids : []
      };

      console.log('Creating task with data:', taskData);

      if (editingTask) {
        await base44.entities.Task.update(editingTask.id, taskData);
        toast.success(t('taskUpdatedSuccess') || 'Task updated successfully!');
      } else {
        await base44.entities.Task.create(taskData);
        toast.success(t('taskAddedSuccess') || 'Task added successfully!');
      }

      await onTaskAdded();

      setFormData({
        title: '',
        description: '',
        icon: 'Star',
        color: '#3B82F6',
        task_type: 'morning',
        base_tokens: 1,
        star_tokens: 15,
        timed_tokens: 10,
        duration_minutes: 15,
        input_type: 'checkbox',
        input_label: '',
        visual_image_url: '',
        is_active: true,
        order: 0,
        child_profile_id: selectedChildId || ''
      });
      setEditingTask(null);
      setShowForm(false);
      setShowAIPrompt(false);
      setAiPrompt('');
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error(t('errorSavingTask') + ': ' + (error.message || 'Unknown error'));
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm(t('confirmDelete', { item: t('tasks') }))) {
      try {
        await base44.entities.Task.delete(taskId);
        await onTaskDeleted();
        toast.success(t('taskDeletedSuccess') || 'Task deleted successfully!');
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error(t('errorDeletingTask') + ': ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleUndoCompletion = async (completion) => {
    if (!window.confirm(t('confirmDelete', { item: t('completed') }))) return;
    
    try {
      const tokensToReturn = completion.tokens_earned || 0;
      
      // Delete the completion record
      await base44.entities.TaskCompletion.delete(completion.id);
      
      // Return tokens to the child profile
      const childProfile = profiles.find(c => c.id === selectedChildId);
      if (childProfile) {
        const newTotalTokens = (childProfile.total_tokens || 0) + tokensToReturn;
        await base44.entities.ChildProfile.update(childProfile.id, {
          total_tokens: newTotalTokens
        });
      }
      
      toast.success(t('taskUndoneSuccess'));
      await loadCompletedTasks();
    } catch (error) {
      console.error('Error undoing task:', error);
      toast.error(t('errorUndoingTask'));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(null);
    setShowAIPrompt(false);
    setAiPrompt('');
    setFormData({
      title: '',
      description: '',
      icon: 'Star',
      color: '#3B82F6',
      task_type: 'morning',
      base_tokens: 1,
      star_tokens: 15,
      timed_tokens: 10,
      duration_minutes: 15,
      input_type: 'checkbox',
      input_label: '',
      visual_image_url: '',
      is_active: true,
      order: 0,
      child_profile_id: selectedChildId || '',
      is_shared: false,
      shared_child_ids: []
    });
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(filteredTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order for all affected tasks
    try {
      const updates = items.map((task, index) => 
        base44.entities.Task.update(task.id, { order: index })
      );
      await Promise.all(updates);
      await onTaskAdded(); // Refresh the list
      toast.success(t('taskOrderUpdated') || 'Task order updated!');
    } catch (error) {
      console.error('Error updating task order:', error);
      toast.error(t('errorSavingTask') || 'Error updating order');
    }
  };

  const handleAddNew = () => {
    if (profiles.length === 0) {
      alert(t('pleaseCreateProfile') || 'Please create a child profile first');
      return;
    }

    setFormData(prev => ({
      ...prev,
      child_profile_id: selectedChildId || profiles[0]?.id || ''
    }));
    setShowForm(true);
    setEditingTask(null);
    setShowAIPrompt(false);
    setAiPrompt('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{t('taskList')}</h3>
          <p className="text-gray-600">{t('manageTasks')}</p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('addNewTask')}
        </Button>
      </div>

      {profiles.length === 0 && (
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">⚠️</div>
              <div>
                <h4 className="font-bold text-gray-800">{t('noChildProfile')}</h4>
                <p className="text-gray-600">{t('pleaseCreateProfile')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && profiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-200"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-lg font-medium">{t('selectChildProfile')} *</Label>
              <Select
                value={formData.child_profile_id}
                onValueChange={(value) => handleInputChange('child_profile_id', value)}
                required
              >
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder={t('selectChildProfile')} />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name} {child.is_adult ? '👤' : `(${child.age} ${t('age')})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('taskName')} *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('taskNamePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('taskTiming')}</Label>
                <Select
                  value={formData.task_type}
                  onValueChange={(value) => handleInputChange('task_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">{t('timingMorning')}</SelectItem>
                    <SelectItem value="evening">{t('timingEvening')}</SelectItem>
                    <SelectItem value="star">{t('timingStar')}</SelectItem>
                    <SelectItem value="timed">{t('timingTimed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('taskDescription')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('taskDescriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('icon')}</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => handleInputChange('icon', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {ICON_LIST.map(icon => (
                      <SelectItem key={icon} value={icon}>
                        {ICON_NAMES[language]?.[icon] || ICON_NAMES['en'][icon] || icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('color')}</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_LIST.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange('color', color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('visualImageOptional')}</Label>
              <p className="text-sm text-gray-600">{t('visualImageDesc')}</p>
              <div className="flex flex-wrap gap-3 items-center">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg border-2 border-indigo-200 transition-colors">
                    <Upload className="w-5 h-5 text-indigo-600" />
                    <span className="text-indigo-600 font-medium">
                      {uploading ? t('uploading') : t('uploadVisualImage')}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                <Button
                  type="button"
                  onClick={() => {
                    setAiPrompt(formData.title); // Pre-fill with title
                    setShowAIPrompt(!showAIPrompt);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={generatingImage}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {language === 'he' && 'צור תמונה בעזרת AI'}
                  {language === 'en' && 'Create Image with AI'}
                  {language === 'ru' && 'Создать с помощью AI'}
                  {language === 'ar' && 'إنشاء بالذكاء الاصطناعي'}
                </Button>

                {formData.visual_image_url && (
                  <a href={formData.visual_image_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">
                    {t('viewImage')}
                  </a>
                )}
              </div>

              {showAIPrompt && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-lg mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <Label className="text-xl font-bold text-purple-900">
                      {language === 'he' && 'יצירת תמונה ✨'}
                      {language === 'en' && 'Create Image ✨'}
                      {language === 'ru' && 'Создать изображение ✨'}
                      {language === 'ar' && 'إنشاء صورة ✨'}
                    </Label>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg mb-4 border-2 border-green-200">
                    <p className="font-bold mb-2 text-green-900 text-base">
                      {language === 'he' && '✅ תאר את הפעולה שהילד צריך לעשות'}
                      {language === 'en' && '✅ Describe the action the child needs to do'}
                      {language === 'ru' && '✅ Опишите действие, которое должен сделать ребенок'}
                      {language === 'ar' && '✅ صف الإجراء الذي يجب على الطفل القيام به'}
                    </p>
                  </div>

                  <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={
                      language === 'he' ? 'לדוגמה: ילד מצחצח שיניים מול המראה, פיג׳מה כחולה' :
                      language === 'en' ? 'Example: child brushing teeth in front of mirror, blue pajamas' :
                      language === 'ru' ? 'Например: ребенок чистит зубы перед зеркалом, синяя пижама' :
                      'مثال: طفل ينظف أسنانه أمام المرآة، بيجاما زرقاء'
                    }
                    rows={4}
                    className="mb-4"
                  />

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handleGenerateImage}
                      disabled={generatingImage || !aiPrompt.trim()}
                      className="bg-purple-600 hover:bg-purple-700 flex-1"
                    >
                      {generatingImage ? (
                        <>
                          <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                          {language === 'he' && 'יוצר...'}
                          {language === 'en' && 'Creating...'}
                          {language === 'ru' && 'Создание...'}
                          {language === 'ar' && 'جاري الإنشاء...'}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          {language === 'he' && 'צור תמונה'}
                          {language === 'en' && 'Create Image'}
                          {language === 'ru' && 'Создать'}
                          {language === 'ar' && 'إنشاء'}
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAIPrompt(false);
                        setAiPrompt('');
                      }}
                    >
                      {t('cancel')}
                    </Button>
                  </div>

                  {formData.visual_image_url && (
                    <div className="mt-4 bg-white p-4 rounded-lg border-2">
                      <img 
                        src={formData.visual_image_url} 
                        alt="Preview" 
                        className="w-full h-48 object-contain rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('taskType')}</Label>
              <Select
                value={formData.input_type}
                onValueChange={(value) => handleInputChange('input_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkbox">{t('taskTypeCheckbox')}</SelectItem>
                  <SelectItem value="text">{t('taskTypeOpen')}</SelectItem>
                  <SelectItem value="timer">{t('taskTypeTimer')}</SelectItem>
                  <SelectItem value="backpack_checklist">{t('taskTypeBackpack')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.input_type === 'text' && (
              <div className="space-y-2">
                <Label>{t('inputLabel')}</Label>
                <Input
                  value={formData.input_label}
                  onChange={(e) => handleInputChange('input_label', e.target.value)}
                  placeholder={t('inputLabelPlaceholder')}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.task_type === 'morning' || formData.task_type === 'evening' ? (
                <div className="space-y-2">
                  <Label>{t('baseTokens')}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.base_tokens}
                    onChange={(e) => handleInputChange('base_tokens', e.target.value)}
                  />
                </div>
              ) : null}

              {formData.task_type === 'star' && (
                <div className="space-y-2">
                  <Label>{t('starTokens')}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.star_tokens}
                    onChange={(e) => handleInputChange('star_tokens', e.target.value)}
                  />
                </div>
              )}

              {formData.task_type === 'timed' && (
                <>
                  <div className="space-y-2">
                    <Label>{t('durationMinutes')}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.duration_minutes}
                      onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('timedTokens')}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.timed_tokens}
                      onChange={(e) => handleInputChange('timed_tokens', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Shared Task Toggle */}
            {profiles.filter(p => !p.is_adult).length > 1 && (
              <div className="space-y-3 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_shared}
                    onChange={e => handleInputChange('is_shared', e.target.checked)}
                    className="w-5 h-5 accent-purple-600"
                  />
                  <div>
                    <p className="font-bold text-purple-800">
                      {language === 'he' ? '👥 משימה משותפת לאחים' : language === 'ru' ? '👥 Совместная задача' : language === 'ar' ? '👥 مهمة مشتركة' : '👥 Shared Sibling Task'}
                    </p>
                    <p className="text-xs text-purple-600">
                      {language === 'he' ? 'כל הילדים שנבחרו צריכים לבצע - הם מקבלים את האסימונים רק כשכולם סיימו' : 'Selected children must all complete it to earn tokens'}
                    </p>
                  </div>
                </label>
                {formData.is_shared && (
                  <div className="space-y-2 mr-8">
                    <p className="text-sm font-medium text-purple-700">{language === 'he' ? 'בחר ילדים:' : 'Select children:'}</p>
                    {profiles.filter(p => !p.is_adult).map(child => (
                      <label key={child.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData.shared_child_ids || []).includes(child.id)}
                          onChange={e => {
                            const ids = formData.shared_child_ids || [];
                            if (e.target.checked) {
                              handleInputChange('shared_child_ids', [...ids, child.id]);
                            } else {
                              handleInputChange('shared_child_ids', ids.filter(id => id !== child.id));
                            }
                          }}
                          className="w-4 h-4 accent-purple-600"
                        />
                        <span className="text-sm font-medium">{child.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t('cancel')}
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingTask ? t('save') : t('add')}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {filteredTasks.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredTasks.map((task, index) => {
                  const childProfile = profiles.find(c => c.id === task.child_profile_id);

                  return (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <Card
                            className={`border-2 hover:shadow-lg transition-shadow ${
                              snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-400' : ''
                            }`}
                            style={{ 
                              borderColor: task.color + '40', 
                              backgroundColor: task.color + '10',
                              ...provided.draggableProps.style
                            }}
                          >
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div className="flex items-start gap-2 flex-1">
                                  <div 
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing pt-1 text-gray-400 hover:text-gray-600"
                                  >
                                    <GripVertical className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: task.color }}
                                      >
                                        <Icon name={task.icon} className="w-5 h-5 text-white" />
                                      </div>
                                      {task.title}
                                    </CardTitle>
                                    {childProfile && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {childProfile.is_adult ? 'מבוגר' : t('childName')}: {childProfile.name}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                      {task.task_type === 'morning' && `${t('morning')} • ${task.base_tokens} ${t('tokens')}`}
                                      {task.task_type === 'evening' && `${t('evening')} • ${task.base_tokens} ${t('tokens')}`}
                                      {task.task_type === 'star' && `⭐ ${t('star')} • ${task.star_tokens} ${t('tokens')}`}
                                      {task.task_type === 'timed' && `⏱️ ${task.duration_minutes} ${t('minutes')} • ${task.timed_tokens} ${t('tokens')}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(task)}
                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                                  >
                                    ✏️
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(task.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            {task.description && (
                              <CardContent>
                                <p className="text-sm text-gray-600">{task.description}</p>
                              </CardContent>
                            )}
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              📝
            </motion.div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">{t('noTasksYet')}</h3>
            <p className="text-gray-500">{t('addNewTask')}</p>
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks Today Section */}
      {selectedChildId && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            {t('completedTasksToday')}
          </h3>
          
          {completedToday.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-8 text-center text-gray-500">
                {t('noCompletedTasksToday')}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedToday.map((completion) => {
                const task = tasksList.find(t => t.id === completion.task_id);
                if (!task) return null;
                
                return (
                  <motion.div
                    key={completion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-green-50 border-2 border-green-200 p-4 rounded-xl flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: task.color }}
                      >
                        <Icon name={task.icon} className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800">{task.title}</p>
                        <p className="text-sm text-gray-600">
                          🪙 {completion.tokens_earned} {t('tokens')}
                          {completion.input_value && ` • ${completion.input_value}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUndoCompletion(completion)}
                      className="border-red-300 text-red-600 hover:bg-red-50 flex-shrink-0"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      {t('undoCompletion')}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}