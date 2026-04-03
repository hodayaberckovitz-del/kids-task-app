import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Icon from './shared/Icon';
import { X } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function ParentMessageCard({ message, icon, onDismiss }) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50, transition: { duration: 0.2 } }}
      className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-6 text-white shadow-lg relative"
      layout
    >
      <div className="flex items-center gap-4">
        <div className="bg-white/30 p-3 rounded-full">
          <Icon name={icon || 'Heart'} className="w-6 h-6 text-white" />
        </div>
        <div className="flex-grow">
          <p className="font-semibold">{t('messageFromParent')}</p>
          <p className="text-lg">{message}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDismiss}
        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 text-white"
      >
        <X className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}