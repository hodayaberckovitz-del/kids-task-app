
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, CheckCircle, XCircle, Gift, Upload, Sparkles, Users } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function WishlistManagementTab({ wishlistItems = [], onDataChange, childProfiles = [], selectedChildId, rewards = [] }) {
  const { t, language } = useLanguage();
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  const selectedProfile = childProfiles.find(c => c.id === selectedChildId);
  
  const handleUpdateStatus = async (itemId, newStatus) => {
    try {
      await base44.entities.WishlistItem.update(itemId, { status: newStatus });
      await onDataChange();
    } catch (error) {
      console.error("Error updating wishlist item:", error);
      alert(t("errorUpdatingWishlistItem") || "Error updating wishlist item");
    }
  };

  const handleConvertToReward = async (item) => {
    if (!selectedProfile) {
      alert(t('pleaseSelectChild') || 'Please select a child first');
      return;
    }
    
    try {
      await base44.entities.Reward.create({
        title: item.title,
        description: item.description,
        cost: 50,
        image_url: item.image_url,
        language: selectedProfile.language || language,
        child_profile_id: selectedProfile.id,
        family_id: selectedProfile.family_id,
        is_claimed: false
      });
      
      await base44.entities.WishlistItem.update(item.id, { 
        status: 'approved',
        is_fulfilled: true,
        linked_reward_id: item.id
      });
      
      await onDataChange();
      toast.success(t('rewardAddedSuccess') || 'Reward created successfully!');
    } catch (error) {
      console.error("Error converting to reward:", error);
      alert(t("errorConvertingToReward") || "Error converting to reward");
    }
  };

  const getStatusConfig = (status) => {
    return {
      requested: { color: 'bg-blue-100 text-blue-800', text: t('statusRequested') || 'Requested' },
      reviewing: { color: 'bg-yellow-100 text-yellow-800', text: t('statusReviewing') || 'Reviewing' },
      approved: { color: 'bg-green-100 text-green-800', text: t('statusApproved') || 'Approved' },
      fulfilled: { color: 'bg-purple-100 text-purple-800', text: t('statusFulfilled') || 'Fulfilled' },
      rejected: { color: 'bg-red-100 text-red-800', text: t('statusRejected') || 'Rejected' }
    };
  };

  const getStatusBadgeColor = (status) => {
    const config = getStatusConfig(status)[status] || getStatusConfig(status).requested;
    return config.color;
  };

  const getStatusText = (status) => {
    const config = getStatusConfig(status)[status] || getStatusConfig(status).requested;
    return config.text;
  };

  const getCardBorderColor = (status) => {
    switch (status) {
      case 'requested': return 'border-blue-300';
      case 'reviewing': return 'border-yellow-300';
      case 'approved': return 'border-green-300';
      case 'fulfilled': return 'border-purple-300';
      case 'rejected': return 'border-red-300';
      default: return 'border-gray-200';
    }
  };

  const handleImageUpload = async (itemId, file) => {
    if (!file) return;

    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.WishlistItem.update(itemId, { image_url: file_url });
      if (onDataChange && typeof onDataChange === 'function') {
        await onDataChange();
      }
      toast.success(t('imageUploadedSuccess') || 'Image uploaded successfully');
    } catch (error) {
      console.error(t('errorUploadingImage') || 'Error uploading image:', error);
      alert(t('errorUploadingImage') || 'Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateImage = async (itemId) => {
    const currentItem = wishlistItems.find(i => i.id === itemId);
    const promptText = aiPrompt.trim() || currentItem?.title || '';
    
    if (!promptText) {
      alert(language === 'he' ? 'אנא הזן תיאור לתמונה' : 
            language === 'en' ? 'Please enter a description' :
            language === 'ru' ? 'Пожалуйста, введите описание' :
            'الرجاء إدخال وصف');
      return;
    }

    try {
      setGeneratingImage(true);
      
      const finalPrompt = `Professional product photography of: ${promptText}

Style: Clean white studio background, professional lighting, commercial product shot, 
high resolution 4K, centered composition, sharp focus, attractive gift presentation,
vibrant appealing colors, suitable for children, desirable and appealing,
no text or labels on image, product catalog quality.

Make it look like a premium gift that any child would want.`;
      
      console.log('Generating image with prompt:', finalPrompt);
      
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: finalPrompt
      });
      
      console.log('Image generated:', url);
      
      await base44.entities.WishlistItem.update(itemId, { image_url: url });
      
      if (onDataChange && typeof onDataChange === 'function') {
        await onDataChange();
      }
      
      setShowAIPrompt(false);
      setAiPrompt('');
      setEditingItem(null);
      toast.success(t('imageUploadedSuccess') || 'Image created successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      alert((language === 'he' ? 'שגיאה ביצירת התמונה: ' : 'Error creating image: ') + (error.message || ''));
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          {t('wishlist')} - {selectedProfile?.name || t('selectChild')}
        </CardTitle>
        <CardDescription>{t('wishlistDesc') || 'Manage wishlist items'}</CardDescription>
      </CardHeader>

      {!selectedProfile && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">{t('pleaseSelectChild') || 'Please select a child'}</h3>
          <p className="text-gray-500">{t('selectChildToManageWishlist') || 'Select a child to manage their wishlist'}</p>
        </div>
      )}

      {selectedProfile && wishlistItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border-2 hover:shadow-lg transition-shadow ${getCardBorderColor(item.status)}`}>
                <div className="h-40 bg-gradient-to-br from-pink-100 to-purple-100 relative overflow-hidden rounded-t-lg">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gift className="w-16 h-16 text-pink-300" />
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <Label className="cursor-pointer">
                      <div className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-all">
                        <Upload className="w-4 h-4 text-gray-700" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(item.id, e.target.files?.[0])}
                        disabled={uploading}
                        className="hidden"
                      />
                    </Label>
                    
                    <Button
                      type="button"
                      onClick={() => {
                        setEditingItem(item.id);
                        setAiPrompt(item.title);
                        setShowAIPrompt(true);
                      }}
                      className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      disabled={generatingImage}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </Button>
                  </div>

                  <Badge className={`absolute top-2 left-2 ${getStatusBadgeColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-500">{t('importance') || 'Importance'}:</span>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < (item.priority || 3) ? "text-yellow-400" : "text-gray-300"}>⭐</span>
                    ))}
                  </div>

                  {item.parent_notes && (
                    <div className="bg-gray-50 p-2 rounded mb-3">
                      <p className="text-sm"><strong>{t('parentNotes') || 'Notes'}:</strong> {item.parent_notes}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {item.status === 'requested' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(item.id, 'reviewing')}>
                          {t('markAsReviewing') || 'Review'}
                        </Button>
                        <Button size="sm" variant="default" onClick={() => handleUpdateStatus(item.id, 'approved')}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t('approve') || 'Approve'}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(item.id, 'rejected')}>
                          <XCircle className="w-4 h-4 mr-1" />
                          {t('reject') || 'Reject'}
                        </Button>
                      </>
                    )}
                    
                    {(item.status === 'approved' || item.status === 'reviewing') && !item.is_fulfilled && (
                      <Button 
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleConvertToReward(item)}
                      >
                        <Gift className="w-4 h-4 mr-1" />
                        {t('convertToReward') || 'Convert to reward'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {selectedProfile && wishlistItems.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">{t('noWishesParent') || 'No wishes yet'}</h3>
          <p className="text-gray-500">{t('noWishesParentDesc') || 'Child hasn\'t added any wishes yet'}</p>
        </div>
      )}

      <AnimatePresence>
        {showAIPrompt && editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowAIPrompt(false);
              setEditingItem(null);
              setAiPrompt('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">
                  {language === 'he' && 'צור תמונה בעזרת AI'}
                  {language === 'en' && 'Create Image with AI'}
                  {language === 'ru' && 'Создать изображение с помощью AI'}
                  {language === 'ar' && 'إنشاء صورة بالذكاء الاصطناعي'}
                </h3>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg mb-3 text-sm border-2 border-blue-200">
                <p className="font-bold mb-2 text-blue-900">
                  {language === 'he' && '💡 תאר את המתנה בפרטים'}
                  {language === 'en' && '💡 Describe the gift in detail'}
                  {language === 'ru' && '💡 Опишите подарок подробно'}
                  {language === 'ar' && '💡 صف الهدية بالتفصيل'}
                </p>
              </div>

              <Label htmlFor="ai-prompt" className="mb-2 block font-bold">
                {language === 'he' && 'תאר את המתנה (או השאר כמו שזה)'}
                {language === 'en' && 'Describe the gift (or leave as is)'}
                {language === 'ru' && 'Опишите подарок (или оставьте как есть)'}
                {language === 'ar' && 'صف الهدية (أو اتركها كما هي)'}
              </Label>
              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={
                  language === 'he' ? 'לדוגמה: טאבלט לילדים עם מסך צבעוני, מגן כחול' :
                  language === 'en' ? 'Example: Children\'s tablet with colorful screen, blue case' :
                  language === 'ru' ? 'Например: Детский планшет с цветным экраном, синий чехол' :
                  'مثال: جهاز لوحي للأطفال بشاشة ملونة، حافظة زرقاء'
                }
                rows={4}
                className="mb-4 text-base"
                autoFocus
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => handleGenerateImage(editingItem)}
                  disabled={generatingImage || !aiPrompt.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {generatingImage ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'he' && 'יוצר תמונה...'}
                      {language === 'en' && 'Creating image...'}
                      {language === 'ru' && 'Создание изображения...'}
                      {language === 'ar' && 'جاري الإنشاء...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {language === 'he' && 'צור תמונה'}
                      {language === 'en' && 'Create Image'}
                      {language === 'ru' && 'Создать изображение'}
                      {language === 'ar' && 'إنشاء صورة'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAIPrompt(false);
                    setEditingItem(null);
                    setAiPrompt('');
                  }}
                >
                  {t('cancel')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
