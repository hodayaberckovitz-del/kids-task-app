
import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from 'lucide-react';

const languages = [
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

export default function LanguageSelector({ compact = false }) {
  const { language, changeLanguage } = useLanguage();

  const currentLanguage = languages.find(lang => lang.code === language);

  if (compact) {
    return (
      <Select value={language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-20 h-10 border-0 bg-transparent hover:bg-white/20 transition-all">
          <div className="flex items-center gap-1">
            <span className="text-lg">{currentLanguage?.flag}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Languages className="w-4 h-4 text-gray-500" />
      <Select value={language} onValueChange={changeLanguage}>
        <SelectTrigger className="w-32">
          <SelectValue>
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentLanguage?.flag}</span>
              <span>{currentLanguage?.name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
