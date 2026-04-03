import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronsRight, Plus, Trash2, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/components/LanguageContext';
import { format, addDays, addWeeks } from 'date-fns';
import { base44 } from '@/api/base44Client';

export default function ChallengeManagementTab({ 
  challenges = [], 
  onAddChallenge, 
  onDeleteChallenge, 
  childProfiles = [], 
  selectedChildId 
}) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    token_bonus: 10,
    required_completions: 5,
    type: 'daily',
    tracking_type: 'distance',
    tracking_unit: 'ק״מ',
    target_value: 5,
    child_profile_id: selectedChildId || ''
  });

  // Ensure childProfiles is always an array
  const profiles = Array.isArray(childProfiles) ? childProfiles : [];
  
  // Filter challenges for selected child or show all if no child selected
  const filteredChallenges = selectedChildId 
    ? (challenges || []).filter(c => c.child_profile_id === selectedChildId)
    : (challenges || []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const user = await base44.auth.me();
      const selectedProfile = profiles.find(p => p.id === formData.child_profile_id);
      
      // Calculate expiration based on type
      const expiresAt = formData.type === 'daily' 
        ? addDays(new Date(), 1).toISOString()
        : addWeeks(new Date(), 1).toISOString();

      const challengeData = {
        title: formData.title,
        description: formData.description,
        token_bonus: Number(formData.token_bonus),
        type: formData.type,
        expires_at: expiresAt,
        is_active: true,
        child_profile_id: formData.child_profile_id,
        family_id: selectedProfile?.family_id || user?.family_id,
        ...(formData.type === 'progress_tracking' ? {
          tracking_type: formData.tracking_type,
          tracking_unit: formData.tracking_unit,
          target_value: Number(formData.target_value),
          current_progress: 0
        } : {
          required_completions: Number(formData.required_completions)
        })
      };

      await onAddChallenge(challengeData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        token_bonus: 10,
        required_completions: 5,
        type: 'daily',
        tracking_type: 'distance',
        tracking_unit: 'ק״מ',
        target_value: 5,
        child_profile_id: selectedChildId || ''
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving challenge:", error);
      alert(t('errorSavingChallenge') || 'Error saving challenge');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{t('challenges')}</h3>
          <p className="text-gray-600">{t('specialChallenges')}</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('add')}
        </Button>
      </div>

      {/* Add Challenge Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('childName')}</Label>
                <Select
                  value={formData.child_profile_id}
                  onValueChange={(value) => handleInputChange('child_profile_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectChildProfile')} />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(child => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('taskType')}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t('daily')}</SelectItem>
                    <SelectItem value="weekly">{t('weekly')}</SelectItem>
                    <SelectItem value="progress_tracking">{t('progressTracking') || 'מעקב התקדמות'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('taskName')}</Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t('taskNamePlaceholder')}
                required
              />
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

            {formData.type === 'progress_tracking' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('trackingType') || 'סוג מעקב'}</Label>
                    <Select
                      value={formData.tracking_type}
                      onValueChange={(value) => handleInputChange('tracking_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distance">{t('distance') || 'מרחק'}</SelectItem>
                        <SelectItem value="count">{t('count') || 'ספירה'}</SelectItem>
                        <SelectItem value="time">{t('time') || 'זמן'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('unit') || 'יחידה'}</Label>
                    <Input
                      value={formData.tracking_unit}
                      onChange={(e) => handleInputChange('tracking_unit', e.target.value)}
                      placeholder="ק״מ, מטר, דקות..."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t('targetValue') || 'יעד'}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.target_value}
                      onChange={(e) => handleInputChange('target_value', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('claimBonus')} ({t('tokens')})</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.token_bonus}
                    onChange={(e) => handleInputChange('token_bonus', e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('completeMoreTasks')}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.required_completions}
                    onChange={(e) => handleInputChange('required_completions', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('claimBonus')} ({t('tokens')})</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.token_bonus}
                    onChange={(e) => handleInputChange('token_bonus', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {t('add')}
              </Button>
            </div>
          </form>
        </motion.div>
      )}

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

      {/* Challenges List */}
      {filteredChallenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChallenges.map((challenge, index) => {
            const childProfile = profiles.find(c => c.id === challenge.child_profile_id);
            const isExpired = new Date(challenge.expires_at) < new Date();
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-2 ${isExpired ? 'border-gray-300 bg-gray-50' : 'border-purple-300 bg-purple-50'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <ChevronsRight className="w-5 h-5 text-purple-600" />
                          {challenge.title}
                        </CardTitle>
                        {childProfile && (
                          <p className="text-sm text-gray-600 mt-1">
                            {t('childName')}: {childProfile.name}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteChallenge(challenge.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {challenge.description && (
                      <p className="text-gray-700 mb-3">{challenge.description}</p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{t('claimBonus')}: +{challenge.token_bonus} {t('tokens')}</span>
                      </div>
                      
                      {challenge.type === 'progress_tracking' ? (
                        <div className="flex items-center gap-2 text-sm">
                          <ChevronsRight className="w-4 h-4 text-blue-500" />
                          <span>{t('target') || 'יעד'}: {challenge.target_value} {challenge.tracking_unit}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                          <ChevronsRight className="w-4 h-4 text-blue-500" />
                          <span>{t('completeMoreTasks')}: {challenge.required_completions} {t('tasks')}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                          {isExpired ? t('overdue') : format(new Date(challenge.expires_at), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          challenge.type === 'daily' 
                            ? 'bg-blue-100 text-blue-700' 
                            : challenge.type === 'weekly'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {challenge.type === 'daily' ? t('daily') : challenge.type === 'weekly' ? t('weekly') : (t('progressTracking') || 'מעקב התקדמות')}
                        </span>
                        {challenge.type === 'progress_tracking' && challenge.current_progress > 0 && (
                          <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                            {(challenge.current_progress || 0).toFixed(1)}/{challenge.target_value} {challenge.tracking_unit}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
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
              🏆
            </motion.div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">{t('noTasksYet')}</h3>
            <p className="text-gray-500">{t('addNewTask')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}