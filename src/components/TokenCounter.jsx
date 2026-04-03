import React from "react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function TokenCounter({ count, className = "" }) {
  const { t } = useLanguage();
  
  // Ensure count is always a valid number
  const tokenCount = Number(count) || 0;
  
  return (
    <motion.div 
      className={`bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 shadow-lg ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center justify-center gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Coins className="w-8 h-8 text-white" />
        </motion.div>
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{tokenCount}</div>
          <div className="text-white/80 text-sm">{t('tokens')}</div>
        </div>
      </div>
    </motion.div>
  );
}