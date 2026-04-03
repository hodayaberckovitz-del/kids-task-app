import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useLanguage } from './LanguageContext';

// All available characters
const ALL_CHARACTERS = [
  { id: 'none', emoji: '⭐', name: 'characterNone' },
  { id: 'superhero', emoji: '🦸‍♂️', name: 'characterSuperhero' },
  { id: 'astronaut', emoji: '👨‍🚀', name: 'characterAstronaut' },
  { id: 'ninja', emoji: '🥷', name: 'characterNinja' },
  { id: 'knight', emoji: '🤺', name: 'characterKnight' },
  { id: 'pirate', emoji: '🏴‍☠️', name: 'characterPirate' },
  { id: 'dinosaur', emoji: '🦖', name: 'characterDinosaur' },
  { id: 'princess', emoji: '👸', name: 'characterPrincess' },
  { id: 'fairy', emoji: '🧚‍♀️', name: 'characterFairy' },
  { id: 'mermaid', emoji: '🧜‍♀️', name: 'characterMermaid' },
  { id: 'ballerina', emoji: '💃', name: 'characterBallerina' },
  { id: 'unicorn', emoji: '🦄', name: 'characterUnicorn' },
  { id: 'butterfly', emoji: '🦋', name: 'characterButterfly' }
];

export default function CharacterSelector({ selected, selectedCharacter, onChange, onSelect }) {
  const { t } = useLanguage();
  
  // Support both prop names for backwards compatibility
  const selectedValue = selected || selectedCharacter;
  const handleSelect = onChange || onSelect;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {t('chooseYourCharacter')}
        </h3>
        <p className="text-gray-600">{t('characterWillGuide')}</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
        {ALL_CHARACTERS.map((char, index) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-all ${
                selectedValue === char.id
                  ? 'ring-4 ring-purple-500 bg-purple-50 shadow-xl'
                  : 'hover:ring-2 hover:ring-purple-300 hover:shadow-lg'
              }`}
              onClick={() => handleSelect && handleSelect(char.id)}
            >
              <div className="text-center">
                <motion.div
                  className="text-5xl mb-2"
                  whileHover={{ scale: 1.3, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  animate={selectedValue === char.id ? { 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {char.emoji}
                </motion.div>
                <p className="font-bold text-xs">{t(char.name)}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}