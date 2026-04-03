import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import CharacterSelector from '../CharacterSelector';
import ColorThemeSelector from '../ColorThemeSelector';

export default function ChildrenManagementTab({ children, onDataChange, currentUser }) {
  const { t, language } = useLanguage();
  const [editingChild, setEditingChild] = useState(null);
  const [deletingChild, setDeletingChild] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'boy',
    favorite_character: 'superhero',
    color_theme: 'blue',
    task_display_mode: 'text_only',
    is_adult: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: 'boy',
      favorite_character: 'superhero',
      color_theme: 'blue',
      task_display_mode: 'text_only',
      is_adult: false
    });
    setEditingChild(null);
    setShowAddForm(false);
  };

  const handleEdit = (child) => {
    setFormData({
      name: child.name,
      age: child.age?.toString() || '',
      gender: child.gender || 'boy',
      favorite_character: child.favorite_character || 'superhero',
      color_theme: child.color_theme || 'blue',
      task_display_mode: child.task_display_mode || 'text_only',
      is_adult: child.is_adult || false
    });
    setEditingChild(child);
    setShowAddForm(false);
  };

  const handleAddNew = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || (!formData.is_adult && !formData.age)) {
      alert(t('fillAllFields'));
      return;
    }

    setIsSaving(true);
    try {
      // Get or create family
      let familyId = currentUser?.family_id;
      
      if (!familyId) {
        const families = await base44.entities.Family.filter({ 
          primary_parent_email: currentUser.email 
        });
        
        if (families.length > 0) {
          familyId = families[0].id;
        } else {
          const familyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const newFamily = await base44.entities.Family.create({
            family_name: `${formData.name}'s Family`,
            family_code: familyCode,
            primary_parent_email: currentUser.email
          });
          familyId = newFamily.id;
        }
        
        await base44.auth.updateMe({ family_id: familyId });
      }

      const childData = {
        name: formData.name.trim(),
        age: formData.is_adult ? null : Number(formData.age),
        gender: formData.is_adult ? null : formData.gender,
        favorite_character: formData.is_adult ? null : formData.favorite_character,
        color_theme: formData.color_theme,
        task_display_mode: formData.is_adult ? 'text_only' : formData.task_display_mode,
        is_adult: formData.is_adult,
        language: editingChild ? editingChild.language : language,
        parent_name: currentUser.full_name || currentUser.email.split('@')[0],
        parent_email: currentUser.email,
        family_id: familyId,
        total_tokens: 0,
        current_streak: 0,
        best_streak: 0
      };

      if (editingChild) {
        await base44.entities.ChildProfile.update(editingChild.id, childData);
      } else {
        await base44.entities.ChildProfile.create(childData);
      }

      await onDataChange();
      resetForm();
      alert(editingChild ? t('childUpdatedSuccess') : t('childAddedSuccess'));
    } catch (error) {
      console.error('Error saving child:', error);
      alert(t('errorSavingChild'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingChild) return;

    try {
      await base44.entities.ChildProfile.delete(deletingChild.id);
      await onDataChange();
      setDeletingChild(null);
      alert(t('childDeletedSuccess'));
    } catch (error) {
      console.error('Error deleting child:', error);
      alert(t('errorDeletingChild'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t('childrenManagement')}</h2>
          <p className="text-gray-600">{t('manageChildrenProfiles')}</p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('addNewChild')}
        </Button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(showAddForm || editingChild) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingChild ? t('editChild') : t('addNewChild')}</span>
                  <Button variant="ghost" size="icon" onClick={resetForm}>
                    <X className="w-5 h-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Type */}
                <div className="space-y-2">
                  <Label>סוג פרופיל</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={!formData.is_adult ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, is_adult: false })}
                      className="h-auto py-3"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">👶</div>
                        <div className="text-sm">ילד</div>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant={formData.is_adult ? 'default' : 'outline'}
                      onClick={() => setFormData({ ...formData, is_adult: true })}
                      className="h-auto py-3"
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">👤</div>
                        <div className="text-sm">מבוגר (TODO List)</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{formData.is_adult ? 'שם' : t('childName')} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={formData.is_adult ? 'הזן שם...' : t('enterChildName')}
                    />
                  </div>

                  {!formData.is_adult && (
                    <div className="space-y-2">
                      <Label htmlFor="age">{t('age')} *</Label>
                      <Input
                        id="age"
                        type="number"
                        min="3"
                        max="18"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder={t('enterAge')}
                      />
                    </div>
                  )}
                </div>

                {!formData.is_adult && (
                  <>
                    {/* Gender */}
                    <div className="space-y-2">
                      <Label>{t('gender')}</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'boy', label: t('boy'), emoji: '👦' },
                          { value: 'girl', label: t('girl'), emoji: '👧' },
                          { value: 'other', label: t('other'), emoji: '👶' }
                        ].map(({ value, label, emoji }) => (
                          <Button
                            key={value}
                            type="button"
                            variant={formData.gender === value ? 'default' : 'outline'}
                            onClick={() => setFormData({ ...formData, gender: value })}
                            className="h-auto py-3"
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-1">{emoji}</div>
                              <div className="text-sm">{label}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Display Mode */}
                    <div className="space-y-2">
                      <Label>{t('taskDisplayMode')}</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant={formData.task_display_mode === 'text_only' ? 'default' : 'outline'}
                          onClick={() => setFormData({ ...formData, task_display_mode: 'text_only' })}
                          className="h-auto py-3 text-right"
                        >
                          <div>
                            <div className="text-lg mb-1">📝 {t('displayModeTextOnly')}</div>
                            <div className="text-xs opacity-70">{t('recommendedForOlderChildren')}</div>
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant={formData.task_display_mode === 'visual_large' ? 'default' : 'outline'}
                          onClick={() => setFormData({ ...formData, task_display_mode: 'visual_large' })}
                          className="h-auto py-3 text-right"
                        >
                          <div>
                            <div className="text-lg mb-1">🎨 {t('displayModeVisualLarge')}</div>
                            <div className="text-xs opacity-70">{t('recommendedForYoungChildren')}</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    {/* Character Selection */}
                    <div className="space-y-2">
                      <Label>{t('favoriteCharacter')}</Label>
                      <CharacterSelector
                        selectedCharacter={formData.favorite_character}
                        onSelect={(char) => setFormData({ ...formData, favorite_character: char })}
                      />
                    </div>
                  </>
                )}

                {/* Color Theme */}
                <div className="space-y-2">
                  <Label>{t('colorTheme')}</Label>
                  <ColorThemeSelector
                    selected={formData.color_theme}
                    onChange={(theme) => setFormData({ ...formData, color_theme: theme })}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {isSaving ? t('saving') : t('save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Children List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children.map((child) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="overflow-hidden">
              <div 
                className="h-24 bg-gradient-to-br p-4 flex items-center justify-center"
                style={{
                  background: child.color_theme === 'blue' ? 'linear-gradient(to br, #3B82F6, #8B5CF6)' :
                             child.color_theme === 'green' ? 'linear-gradient(to br, #10B981, #3B82F6)' :
                             child.color_theme === 'purple' ? 'linear-gradient(to br, #8B5CF6, #EC4899)' :
                             child.color_theme === 'red' ? 'linear-gradient(to br, #EF4444, #F59E0B)' :
                             child.color_theme === 'pink' ? 'linear-gradient(to br, #EC4899, #F472B6)' :
                             child.color_theme === 'rainbow' ? 'linear-gradient(to br, #F59E0B, #EF4444, #EC4899, #8B5CF6, #3B82F6, #10B981)' :
                             'linear-gradient(to br, #3B82F6, #8B5CF6)'
                }}
              >
                <div className="text-5xl">
                  {child.favorite_character === 'superhero' ? '🦸‍♂️' :
                   child.favorite_character === 'astronaut' ? '👨‍🚀' :
                   child.favorite_character === 'ninja' ? '🥷' :
                   child.favorite_character === 'knight' ? '🤺' :
                   child.favorite_character === 'pirate' ? '🏴‍☠️' :
                   child.favorite_character === 'dinosaur' ? '🦖' :
                   child.favorite_character === 'princess' ? '👸' :
                   child.favorite_character === 'fairy' ? '🧚‍♀️' :
                   child.favorite_character === 'mermaid' ? '🧜‍♀️' :
                   child.favorite_character === 'ballerina' ? '💃' :
                   child.favorite_character === 'unicorn' ? '🦄' :
                   child.favorite_character === 'butterfly' ? '🦋' : '⭐'}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{child.name}</h3>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>{t('age')}:</span>
                    <span className="font-medium">{child.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('tokens')}:</span>
                    <span className="font-medium">🪙 {child.total_tokens || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('displayMode')}:</span>
                    <span className="font-medium">
                      {child.task_display_mode === 'visual_large' ? '🎨' : '📝'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(child)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    {t('edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingChild(child)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {children.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">{t('noChildrenYet')}</h3>
            <p className="text-gray-500 mb-6">{t('addFirstChild')}</p>
            <Button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('addNewChild')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingChild} onOpenChange={() => setDeletingChild(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteChildDesc', { name: deletingChild?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}