import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import CharacterSelector from "@/components/CharacterSelector";
import ColorThemeSelector from "@/components/ColorThemeSelector";

export default function OnboardingModal({ isOpen, onClose, onProfileCreated, profileName = null }) {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "boy",
    favorite_character: "none",
    color_theme: "minimal",
    task_display_mode: "text_only",
    parent_name: "",
    parent_email: "",
    is_adult: false
  });

  useEffect(() => {
    if (isOpen) {
      const fetchUserDetails = async () => {
        try {
          const user = await base44.auth.me();
          setFormData(prev => ({
            ...prev,
            parent_name: user.full_name || '',
            parent_email: user.email || ''
          }));
        } catch (e) {
          console.error("Failed to fetch user details for onboarding:", e);
        }
      };
      fetchUserDetails();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      setError(t('fillAllFields'));
      return;
    }
    if (step === 1 && !formData.is_adult && !formData.age) {
      setError(t('fillAllFields'));
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.parent_name || !formData.parent_email) {
      setError(t('fillAllFields'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const user = await base44.auth.me();
      let familyId = user.family_id;

      if (!familyId) {
        const existingFamilies = await base44.entities.Family.filter({
          primary_parent_email: user.email
        });

        if (existingFamilies.length > 0) {
          familyId = existingFamilies[0].id;
        } else {
          const familyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const newFamily = await base44.entities.Family.create({
            family_name: `${user.full_name || user.email.split('@')[0]}'s Family`,
            family_code: familyCode,
            primary_parent_email: user.email
          });
          familyId = newFamily.id;
        }

        await base44.auth.updateMe({ family_id: familyId });
      }

      const profileData = {
        name: formData.name,
        age: formData.is_adult ? null : (formData.age ? Number(formData.age) : undefined),
        gender: formData.is_adult ? null : (formData.gender || 'other'),
        favorite_character: formData.is_adult ? null : (formData.favorite_character || 'star'),
        color_theme: formData.color_theme || 'blue',
        task_display_mode: formData.is_adult ? 'text_only' : (formData.task_display_mode || 'text_only'),
        is_adult: formData.is_adult,
        parent_name: formData.parent_name,
        parent_email: formData.parent_email,
        language: language,
        family_id: familyId,
        total_tokens: 0,
        current_streak: 0,
        best_streak: 0
      };

      const newProfile = await base44.entities.ChildProfile.create(profileData);

      localStorage.setItem('selectedChildId', newProfile.id);

      setSuccess(true);

      // Wait for success animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Close modal first
      onClose();
      
      // Then reload data
      if (onProfileCreated) {
        await onProfileCreated();
      }

    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err.message || 'Error creating profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <motion.div
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 text-center max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          dir={language === 'he' ? 'rtl' : 'ltr'}
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="text-8xl mb-6">🎉</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">{t('awesome')}!</h3>
              <p className="text-gray-600">{t('loading')}</p>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-7xl mb-4"
              >
                {step === 1 && '👶'}
                {step === 2 && '🎨'}
                {step === 3 && '⭐'}
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {step === 1 && t('createProfile')}
                {step === 2 && t('chooseCharacterAndColors')}
                {step === 3 && t('displayPreferences')}
              </h2>

              <p className="text-gray-600 mb-6">
                {step === 1 && t('enterChildDetails')}
                {step === 2 && t('makeItPersonal')}
                {step === 3 && t('howToShowTasks')}
              </p>

              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`h-2 w-16 rounded-full transition-all ${
                      i <= step ? 'bg-purple-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-right">
                    <Label className="text-lg font-medium mb-2 block">
                      סוג פרופיל
                    </Label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleInputChange('is_adult', false)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          !formData.is_adult
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-1">👶</div>
                        <div className="font-medium">ילד</div>
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleInputChange('is_adult', true)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.is_adult
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-1">👤</div>
                        <div className="font-medium">מבוגר (TODO List)</div>
                      </motion.button>
                    </div>
                  </div>

                  <div className="text-right">
                    <Label htmlFor="name" className="text-lg font-medium">
                      {formData.is_adult ? 'שם' : t('childName')} *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={formData.is_adult ? 'הזן שם...' : t('enterChildName')}
                      className="text-lg h-12 mt-2"
                      autoFocus
                    />
                  </div>

                  {!formData.is_adult && (
                    <>
                      <div className="text-right">
                        <Label htmlFor="age" className="text-lg font-medium">
                          {t('age')} *
                        </Label>
                        <Input
                          id="age"
                          type="number"
                          min="3"
                          max="18"
                          value={formData.age}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          placeholder={t('enterAge')}
                          className="text-lg h-12 mt-2"
                        />
                      </div>

                      <div className="text-right">
                        <Label className="text-lg font-medium mb-2 block">
                          {t('gender')}
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'boy', label: t('boy'), emoji: '👦' },
                            { value: 'girl', label: t('girl'), emoji: '👧' },
                            { value: 'other', label: t('other'), emoji: '👶' }
                          ].map(({ value, label, emoji }) => (
                            <motion.button
                              key={value}
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleInputChange('gender', value)}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                formData.gender === value
                                  ? 'border-purple-500 bg-purple-100'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="text-3xl mb-1">{emoji}</div>
                              <div className="font-medium">{label}</div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {!formData.is_adult && (
                    <div>
                      <Label className="text-lg font-medium mb-3 block">
                        {t('favoriteCharacter')}
                      </Label>
                      <CharacterSelector
                        selected={formData.favorite_character}
                        onChange={(char) => handleInputChange('favorite_character', char)}
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-lg font-medium mb-3 block">
                      {t('colorTheme')}
                    </Label>
                    <ColorThemeSelector
                      selected={formData.color_theme}
                      onChange={(theme) => handleInputChange('color_theme', theme)}
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && !formData.is_adult && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInputChange('task_display_mode', 'text_only')}
                      className={`p-6 rounded-xl border-2 transition-all text-right ${
                        formData.task_display_mode === 'text_only'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-4xl mb-3">📝</div>
                      <h4 className="font-bold text-lg mb-2">{t('displayModeTextOnly')}</h4>
                      <p className="text-sm text-gray-600">{t('displayModeTextOnlyDesc')}</p>
                      <p className="text-xs text-purple-600 mt-2">{t('recommendedForOlderChildren')}</p>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInputChange('task_display_mode', 'visual_large')}
                      className={`p-6 rounded-xl border-2 transition-all text-right ${
                        formData.task_display_mode === 'visual_large'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-4xl mb-3">🎨</div>
                      <h4 className="font-bold text-lg mb-2">{t('displayModeVisualLarge')}</h4>
                      <p className="text-sm text-gray-600">{t('displayModeVisualLargeDesc')}</p>
                      <p className="text-xs text-purple-600 mt-2">{t('recommendedForYoungChildren')}</p>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 3 && formData.is_adult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-lg text-gray-700">מוכן ליצור פרופיל TODO List למבוגרים</p>
                </motion.div>
              )}

              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-12 text-lg"
                    disabled={isLoading}
                  >
                    {t('back')}
                  </Button>
                )}

                {(step < 3 && !formData.is_adult) || (step < 2 && formData.is_adult) ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {t('continue')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 h-12 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t('creating')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        {t('createProfile')}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}