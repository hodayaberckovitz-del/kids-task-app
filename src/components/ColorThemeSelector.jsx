import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useLanguage } from './LanguageContext';

// All color themes available for everyone
const ALL_COLOR_THEMES = [
  { id: 'blue', name: 'themeBlue', gradient: 'from-blue-400 to-cyan-400', emoji: '🌊' },
  { id: 'pink', name: 'themePink', gradient: 'from-pink-400 to-rose-400', emoji: '🌸' },
  { id: 'purple', name: 'themePurple', gradient: 'from-purple-400 to-pink-400', emoji: '💜' },
  { id: 'green', name: 'themeGreen', gradient: 'from-green-400 to-emerald-400', emoji: '🌲' },
  { id: 'red', name: 'themeRed', gradient: 'from-red-400 to-orange-400', emoji: '🔥' },
  { id: 'rainbow', name: 'themeRainbow', gradient: 'from-pink-400 via-purple-400 to-cyan-400', emoji: '🌈' },
  { id: 'space', name: 'themeSpace', gradient: 'from-indigo-600 to-purple-900', emoji: '🚀' },
  { id: 'ocean', name: 'themeOcean', gradient: 'from-blue-600 to-teal-500', emoji: '🐳' },
  { id: 'minimal', name: 'themeMinimal', gradient: 'from-gray-100 to-gray-200', emoji: '⚪' },
  { id: 'dark', name: 'themeDark', gradient: 'from-gray-700 to-gray-900', emoji: '⚫' },
  { id: 'nature', name: 'themeNature', gradient: 'from-green-300 to-blue-400', emoji: '🌿' }
];

export default function ColorThemeSelector({ selected, selectedTheme, onChange, onSelect }) {
  const { t } = useLanguage();
  
  // Support both prop names for backwards compatibility
  const selectedValue = selected || selectedTheme;
  const handleSelect = onChange || onSelect;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {t('letsPickColors')}
        </h3>
        <p className="text-gray-600">{t('selectColorTheme')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ALL_COLOR_THEMES.map((theme, index) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-all overflow-hidden ${
                selectedValue === theme.id
                  ? 'ring-4 ring-yellow-400 shadow-xl'
                  : 'hover:ring-2 hover:ring-gray-300 hover:shadow-lg'
              }`}
              onClick={() => handleSelect && handleSelect(theme.id)}
            >
              <div className={`h-20 bg-gradient-to-r ${theme.gradient} rounded-lg mb-3 flex items-center justify-center`}>
                <motion.div
                  className="text-4xl"
                  whileHover={{ scale: 1.3, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  animate={selectedValue === theme.id ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {theme.emoji}
                </motion.div>
              </div>
              <p className="font-bold text-center text-xs">{t(theme.name)}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}