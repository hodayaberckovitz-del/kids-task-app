import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Trash2, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'react-hot-toast'; // Added toast import

export default function RewardManagementTab({ rewards = [], onRewardAdded, onRewardDeleted, childProfiles = [], selectedChildId }) {
  const { t, language } = useLanguage(); // Destructure language here
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false); // New state for AI image generation
  const [showAIPrompt, setShowAIPrompt] = useState(false);       // New state to toggle AI prompt input
  const [aiPrompt, setAiPrompt] = useState('');                 // New state for AI prompt text

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cost: 10,
    image_url: '',
    child_profile_id: selectedChildId || ''
  });

  // Ensure arrays with safe defaults
  const profiles = Array.isArray(childProfiles) ? childProfiles : [];
  const rewardsList = Array.isArray(rewards) ? rewards : [];

  // Filter rewards based on selected child
  const filteredRewards = selectedChildId
    ? rewardsList.filter(reward => reward.child_profile_id === selectedChildId)
    : rewardsList;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      title: reward.title || reward.name || '',
      description: reward.description || '',
      cost: reward.cost || reward.token_cost || 10,
      image_url: reward.image_url || '',
      child_profile_id: reward.child_profile_id || selectedChildId || ''
    });
    setShowForm(true);
    setShowAIPrompt(false); // Hide AI prompt when editing
    setAiPrompt('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleInputChange('image_url', file_url);
    } catch (error) {
      console.error(t('errorUploadingImage'), error);
      alert(t('errorUploadingImage'));
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) {
      alert(t('aiPromptRequired')); // Using translated string
      return;
    }

    try {
      setGeneratingImage(true);
      
      const languageNames = {
        he: 'Hebrew',
        en: 'English',
        ru: 'Russian',
        ar: 'Arabic'
      };
      
      const currentLanguage = languageNames[language] || 'Hebrew'; // Fallback to Hebrew if language is not recognized or undefined
      
      console.log(`Translating reward image prompt from ${currentLanguage}:`, aiPrompt);
      
      const translatedPrompt = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert at creating prompts for AI product photography.

The user wrote this description in ${currentLanguage}:
"${aiPrompt}"

Your task:
1. Translate it to English (if not already in English)
2. Make it VERY detailed and specific for product photography
3. Add technical photography details  
4. Make it attractive for children

Format as a detailed product photography prompt.
Focus on: product details, colors, angle, lighting, background.

Example input (Hebrew): "אופניים אדומים"
Example output: "Professional product photo of bright red children's bicycle with two wheels, chrome silver handlebars, white front basket, black rubber tires with treads, shot from 45 degree side angle, clean white studio background, professional studio lighting, high resolution 4K, commercial product photography, vibrant colors, sharp focus, appealing to children"

Example input (Russian): "красный велосипед"
Example output: "High-quality product photograph of a bright red bicycle for children, shiny chrome handlebars, white basket in front, black tires, side view angle, pure white background, studio lighting setup, 4K resolution, commercial photography style, attractive and colorful"

Example input (Arabic): "دراجة حمراء"
Example output: "Professional product shot of a vibrant red children's bicycle, metallic silver handlebars, white front basket, rubber tires, 45-degree angle view, clean white studio background, bright even lighting, 4K quality, e-commerce photography style"

Now translate and enhance this ${currentLanguage} prompt:
"${aiPrompt}"

Return ONLY the enhanced English prompt, nothing else.`,
        add_context_from_internet: false
      });
      
      console.log('Enhanced reward prompt:', translatedPrompt);
      
      const finalPrompt = `${translatedPrompt}

Photography style: professional product photography, clean white background, studio lighting setup, 
commercial e-commerce quality, high resolution 4K, sharp focus, vibrant appealing colors,
centered composition, no text or labels, attractive to children.
Important: The product should be CLEARLY VISIBLE and look desirable.`;
      
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: finalPrompt
      });
      
      console.log('Reward image generated:', url);
      handleInputChange('image_url', url);
      setShowAIPrompt(false);
      setAiPrompt('');
    } catch (error) {
      console.error(t('errorGeneratingImage'), error); // Using translated string
      alert(t('errorGeneratingImageDetail')); // Using translated string
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.child_profile_id) {
        alert(t('pleaseCreateProfile') || 'Please select a child profile'); // Updated alert message
        return;
      }

      const user = await base44.auth.me();
      const selectedProfile = profiles.find(p => p.id === formData.child_profile_id);

      const familyId = selectedProfile?.family_id || user?.family_id;

      if (!familyId) {
        console.error('Missing family_id:', { user, selectedProfile }); // More detailed logging
        alert(t('errorSavingReward') + ': Missing family_id. Please refresh and try again.'); // Updated alert message
        return;
      }

      const rewardData = {
        title: formData.title,
        description: formData.description,
        cost: Number(formData.cost),
        image_url: formData.image_url,
        is_claimed: false,
        language: language,
        child_profile_id: formData.child_profile_id,
        family_id: familyId
      };

      console.log('Creating reward with data:', rewardData);

      if (editingReward) {
        await base44.entities.Reward.update(editingReward.id, rewardData);
        toast.success(t('rewardUpdatedSuccess') || 'Reward updated successfully!'); // Added toast message
      } else {
        await base44.entities.Reward.create(rewardData);
        toast.success(t('rewardAddedSuccess') || 'Reward added successfully!'); // Added toast message
      }

      await onRewardAdded();

      setFormData({
        title: '',
        description: '',
        cost: 50,
        image_url: '',
        child_profile_id: selectedChildId || ''
      });
      setEditingReward(null);
      setShowForm(false);
      setShowAIPrompt(false);
      setAiPrompt('');
    } catch (error) {
      console.error("Error saving reward:", error);
      toast.error(t('errorSavingReward') + ': ' + (error.message || 'Unknown error')); // Changed alert to toast.error
    }
  };

  const handleDelete = async (rewardId) => {
    if (window.confirm(t('confirmDelete', { item: t('rewards') }))) {
      try {
        await base44.entities.Reward.delete(rewardId);
        await onRewardDeleted();
        toast.success(t('rewardDeletedSuccess') || 'Reward deleted successfully!');
      } catch (error) {
        console.error("Error deleting reward:", error);
        // If already deleted, just refresh the list
        if (error.message && error.message.includes('not found')) {
          await onRewardDeleted();
          toast.success(t('rewardDeletedSuccess') || 'Reward deleted successfully!');
        } else {
          toast.error(t('errorDeletingReward') + ': ' + (error.message || 'Unknown error'));
        }
      }
    }
  };

  const createSampleRewards = async () => {
    if (!selectedChildId || profiles.length === 0) {
      alert(t('pleaseSelectChild'));
      return;
    }
    const profile = profiles.find(p => p.id === selectedChildId);
    if (!profile) return;
    const user = await base44.auth.me();
    const familyId = profile.family_id || user?.family_id;
    const samples = [
      { title: language === 'he' ? '30 דקות מסך' : language === 'ru' ? '30 минут экрана' : language === 'ar' ? '30 دقيقة شاشة' : '30 min screen time', cost: 50, description: '' },
      { title: language === 'he' ? 'גלידה' : language === 'ru' ? 'Мороженое' : language === 'ar' ? 'آيس كريم' : 'Ice Cream', cost: 30, description: '' },
      { title: language === 'he' ? 'יציאה לפארק' : language === 'ru' ? 'Поход в парк' : language === 'ar' ? 'نزهة للحديقة' : 'Trip to the Park', cost: 100, description: '' },
      { title: language === 'he' ? 'בחירת ארוחת ערב' : language === 'ru' ? 'Выбор ужина' : language === 'ar' ? 'اختيار العشاء' : 'Choose Dinner', cost: 40, description: '' },
    ];
    for (const s of samples) {
      await base44.entities.Reward.create({ ...s, is_claimed: false, language, child_profile_id: selectedChildId, family_id: familyId });
    }
    await onRewardAdded();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReward(null);
    setFormData({
      title: '',
      description: '',
      cost: 10,
      image_url: '',
      child_profile_id: selectedChildId || ''
    });
    setShowAIPrompt(false); // Hide AI prompt on cancel
    setAiPrompt('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{t('rewardList')}</h3>
          <p className="text-gray-600">{t('setupRewards')}</p>
        </div>
        <div className="flex gap-2">
          {filteredRewards.length === 0 && (
            <Button
              variant="outline"
              onClick={createSampleRewards}
              className="border-yellow-400 text-yellow-700"
            >
              ✨ {language === 'he' ? 'פרסים לדוגמה' : language === 'ru' ? 'Примеры' : language === 'ar' ? 'أمثلة' : 'Sample Rewards'}
            </Button>
          )}
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            {editingReward ? t('edit') : t('add')}
          </Button>
        </div>
      </div>

      {/* No Profiles Warning */}
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

      {/* Add/Edit Reward Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-yellow-200"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Child Profile Selection */}
            <div className="space-y-2">
              <Label className="text-lg font-medium">{t('selectChildProfile')}</Label>
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
                      {child.name} ({child.age} {t('age')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('rewardName')}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('rewardNamePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{t('costInTokens')}</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('rewardDescription')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('rewardDescriptionPlaceholder')}
                rows={3}
              />
            </div>

            {/* Image Upload/Generate */}
            <div className="space-y-2">
              <Label>{t('imageOptional')}</Label>
              <div className="flex flex-wrap gap-3 items-center">
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg border-2 border-yellow-200 transition-colors">
                    <Upload className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-600 font-medium">
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
                  onClick={() => setShowAIPrompt(!showAIPrompt)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={generatingImage}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {language === 'he' && 'צור תמונה בעזרת AI'}
                  {language === 'en' && 'Generate Image with AI'}
                  {language === 'ru' && 'Создать изображение с помощью AI'}
                  {language === 'ar' && 'إنشاء صورة بالذكاء الاصطناعي'}
                </Button>

                {formData.image_url && (
                  <a
                    href={formData.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    {t('viewImage')}
                  </a>
                )}
              </div>

              {/* AI Image Generation Prompt */}
              <AnimatePresence>
                {showAIPrompt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-lg"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                      <Label className="text-xl font-bold text-purple-900">
                        {language === 'he' && 'יצירת תמונה באמצעות AI ✨'}
                        {language === 'en' && 'Create Image with AI ✨'}
                        {language === 'ru' && 'Создать изображение с помощью AI ✨'}
                        {language === 'ar' && 'إنشاء صورة بالذكاء الاصطناعي ✨'}
                      </Label>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg mb-4 border-2 border-green-200">
                      <p className="font-bold mb-2 text-green-900 text-base">
                        {language === 'he' && '✅ כתוב בעברית - המערכת תתרגם!'}
                        {language === 'en' && '✅ Write in English - system will enhance it!'}
                        {language === 'ru' && '✅ Пишите на русском - система переведет!'}
                        {language === 'ar' && '✅ اكتب بالعربية - سيترجم النظام!'}
                      </p>
                      <ul className="text-green-700 space-y-1 text-sm mr-4">
                        {language === 'he' && (
                          <>
                            <li>• תאר את המתנה **בדיוק** - "אופניים אדומים עם 2 גלגלים"</li>
                            <li>• הוסף **צבעים וגדלים** - "טאבלט 10 אינץ' שחור"</li>
                            <li>• ציין **זווית** - "מהצד", "מלפנים"</li>
                            <li>• פרטים קטנים עוזרים - "הגה כסוף", "סל לבן"</li>
                          </>
                        )}
                        {language === 'en' && (
                          <>
                            <li>• Describe the gift **exactly** - "red bicycle with 2 wheels"</li>
                            <li>• Add **colors and sizes** - "10 inch black tablet"</li>
                            <li>• Mention **angle** - "from the side", "front view"</li>
                            <li>• Small details help - "silver handlebars", "white basket"</li>
                          </>
                        )}
                        {language === 'ru' && (
                          <>
                            <li>• Опишите подарок **точно** - "красный велосипед с 2 колесами"</li>
                            <li>• Добавьте **цвета и размеры** - "черный планшет 10 дюймов"</li>
                            <li>• Укажите **угол** - "сбоку", "вид спереди"</li>
                            <li>• Мелкие детали помогают - "серебряный руль", "белая корзина"</li>
                          </>
                        )}
                        {language === 'ar' && (
                          <>
                            <li>• صف الهدية **بدقة** - "دراجة حمراء بعجلتين"</li>
                            <li>• أضف **الألوان والأحجام** - "جهاز لوحي أسود 10 بوصة"</li>
                            <li>• حدد **الزاوية** - "من الجانب"، "منظر أمامي"</li>
                            <li>• التفاصيل الصغيرة تساعد - "مقود فضي"، "سلة بيضاء"</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg mb-4 border-2 border-blue-200">
                      <p className="font-bold mb-2 text-blue-900 text-base">
                        {language === 'he' && '💡 דוגמאות מנצחות:'}
                        {language === 'en' && '💡 Winning Examples:'}
                        {language === 'ru' && '💡 Примеры-победители:'}
                        {language === 'ar' && '💡 أمثلة فائزة:'}
                      </p>
                      <div className="space-y-2">
                        {language === 'he' && (
                          <>
                            <div className="bg-white p-2 rounded-lg">
                              <p className="text-xs text-gray-600 italic">🚲 "אופניים אדומים חדשים עם 2 גלגלים שחורים, הגה כסוף, סל לבן מלפנים, צילום מהצד"</p>
                            </div>
                            <div className="bg-white p-2 rounded-lg">
                              <p className="text-xs text-gray-600 italic">🎮 "פלייסטיישן 5 לבן-שחור עם שני שלטים לבנים, מצולם מלפנים על רקע לבן"</p>
                            </div>
                          </>
                        )}
                        {language === 'en' && (
                          <>
                            <div className="bg-white p-2 rounded-lg">
                              <p className="text-xs text-gray-600 italic">🚲 "New red bicycle with 2 black wheels, silver handlebars, white front basket, shot from the side"</p>
                            </div>
                            <div className="bg-white p-2 rounded-lg">
                              <p className="text-xs text-gray-600 italic">🎮 "PlayStation 5 white-black with two white controllers, shot from front on white background"</p>
                            </div>
                          </>
                        )}
                        {language === 'ru' && (
                          <>
                            <div className="bg-white p-2 rounded-lg">
                              <p className="text-xs text-gray-600 italic">🚲 "Новый красный велосипед с 2 черными колесами, серебряный руль, белая корзина спереди, вид сбоку"</p>
                            </div>
                            <div className="bg-white p-2 rounded-lg">
                              <p className="text-xs text-gray-600 italic">🎮 "PlayStation 5 бело-черная с двумя белыми контроллерами, вид спереди на белом фоне"</p>
                            </div>
                          </>
                        )}
                        {language === 'ar' && (
                          <>
                            <div className="bg-white p-2 rounded-lg">
                              <p className="text-xs text-gray-600 italic">🚲 "دراجة حمراء جديدة بعجلتين سوداوين، مقود فضي، سلة بيضاء في الأمام، تصوير من الجانب"</p>
                            </div>
                            <div className="bg-white p-2 rounded-lg">
                              <p className="text-xs text-gray-600 italic">🎮 "بلايستيشن 5 أبيض-أسود مع يدتي تحكم بيضاء، تصوير من الأمام على خلفية بيضاء"</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <Textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={
                        language === 'he' ? 'לדוגמה: אופניים אדומים חדשים עם 2 גלגלים, הגה כסוף וסל לבן מלפנים' :
                        language === 'en' ? 'Example: New red bicycle with 2 wheels, silver handlebars and white front basket' :
                        language === 'ru' ? 'Например: Новый красный велосипед с 2 колесами, серебряный руль и белая корзина спереди' :
                        'مثال: دراجة حمراء جديدة بعجلتين، مقود فضي وسلة بيضاء في الأمام'
                      }
                      rows={4}
                      className="mb-4 text-base border-2"
                    />

                    <div className="flex gap-3 mb-4">
                      <Button
                        type="button"
                        onClick={handleGenerateImage}
                        disabled={generatingImage || !aiPrompt.trim()}
                        className="bg-purple-600 hover:bg-purple-700 flex-1 h-12 text-base font-bold"
                      >
                        {generatingImage ? (
                          <>
                            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                            {language === 'he' && 'יוצר תמונה... (20-30 שניות)'}
                            {language === 'en' && 'Creating... (20-30 seconds)'}
                            {language === 'ru' && 'Создание... (20-30 секунд)'}
                            {language === 'ar' && 'جاري الإنشاء... (20-30 ثانية)'}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            {language === 'he' && 'צור תמונה מקצועית! 📸'}
                            {language === 'en' && 'Create Professional Image! 📸'}
                            {language === 'ru' && 'Создать профессиональное изображение! 📸'}
                            {language === 'ar' && 'إنشاء صورة احترافية! 📸'}
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
                        className="h-12"
                      >
                        {language === 'he' && 'ביטול'}
                        {language === 'en' && 'Cancel'}
                        {language === 'ru' && 'Отмена'}
                        {language === 'ar' && 'إلغاء'}
                      </Button>
                    </div>
                    
                    {formData.image_url && (
                      <div className="mt-4">
                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-3">
                          <p className="text-sm font-bold text-gray-700 mb-2">
                            {language === 'he' && 'תצוגה מקדימה:'}
                            {language === 'en' && 'Preview:'}
                            {language === 'ru' && 'Предпросмотр:'}
                            {language === 'ar' && 'معاينة:'}
                          </p>
                          <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="w-full h-48 object-contain rounded-lg bg-gray-50"
                          />
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-200">
                          <p className="text-yellow-900 font-bold text-sm">
                            {language === 'he' && '💡 לא מושלם?'}
                            {language === 'en' && '💡 Not perfect?'}
                            {language === 'ru' && '💡 Не идеально?'}
                            {language === 'ar' && '💡 ليست مثالية؟'}
                          </p>
                          <p className="text-yellow-800 text-sm">
                            {language === 'he' && 'שנה את התיאור והוסף עוד פרטים - המערכת משתפרת עם כל ניסיון! 🎯'}
                            {language === 'en' && 'Change the description and add more details - system improves with each try! 🎯'}
                            {language === 'ru' && 'Измените описание и добавьте больше деталей - система улучшается с каждой попыткой! 🎯'}
                            {language === 'ar' && 'غيّر الوصف وأضف المزيد من التفاصيل - يتحسن النظام مع كل محاولة! 🎯'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="bg-purple-50 p-3 rounded-lg border-2 border-purple-200 mt-3">
                      <p className="text-xs text-purple-700 text-center">
                        {language === 'he' && '⚡ התיאור שלך מתורגם אוטומטית ומשתפר על ידי AI לתוצאות מושלמות'}
                        {language === 'en' && '⚡ Your description is automatically translated and enhanced by AI for perfect results'}
                        {language === 'ru' && '⚡ Ваше описание автоматически переводится и улучшается ИИ для идеальных результатов'}
                        {language === 'ar' && '⚡ يُترجم وصفك تلقائياً ويحسّن بواسطة الذكاء الاصطناعي للحصول على نتائج مثالية'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t('cancel')}
              </Button>
              <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
                {editingReward ? t('save') : t('add')}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Rewards List */}
      {filteredRewards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRewards.map((reward, index) => {
            const childProfile = profiles.find(c => c.id === reward.child_profile_id);
            const rewardCost = reward.cost || reward.token_cost || 0;

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-2 border-yellow-200 hover:shadow-lg transition-shadow">
                  {reward.image_url && (
                    <div className="h-40 overflow-hidden rounded-t-lg">
                      <img
                        src={reward.image_url}
                        alt={reward.title || reward.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {reward.title || reward.name}
                        </CardTitle>
                        {childProfile && (
                          <p className="text-sm text-gray-600 mt-1">
                            {t('childName')}: {childProfile.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          🪙 {rewardCost} {t('tokens')}
                        </p>
                        {reward.is_claimed && (
                          <p className="text-sm text-green-600 font-medium mt-1">
                            ✅ {t('claimed')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(reward)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(reward.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {reward.description && (
                    <CardContent>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🎁
            </motion.div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">{t('noRewardsYetParent')}</h3>
            <p className="text-gray-500">{t('addNewTask')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}