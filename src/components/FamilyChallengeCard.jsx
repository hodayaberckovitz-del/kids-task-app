import React from "react";
import { motion } from "framer-motion";
import { differenceInDays, parseISO } from "date-fns";
import { useLanguage } from "@/components/LanguageContext";

export default function FamilyChallengeCard({ challenge }) {
  const { isRTL } = useLanguage();
  if (!challenge || !challenge.is_active || challenge.is_completed) return null;

  const progress = Math.min(100, Math.round(((challenge.current_value || 0) / (challenge.target_value || 1)) * 100));
  const daysLeft = Math.max(0, differenceInDays(parseISO(challenge.end_date), new Date()));

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-3xl p-5 shadow-xl text-white">
        <div className={`flex items-start justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
              🏆 {isRTL ? "אתגר משפחתי" : "Family Challenge"}
            </div>
            <h3 className="text-xl font-black">{challenge.title}</h3>
            {challenge.description && (
              <p className="text-sm opacity-90 mt-0.5">{challenge.description}</p>
            )}
          </div>
          <div className={`text-center flex-shrink-0 bg-white/20 rounded-2xl px-3 py-2 ${isRTL ? "mr-3" : "ml-3"}`}>
            <p className="text-2xl font-black">{daysLeft}</p>
            <p className="text-xs opacity-80">{isRTL ? "ימים" : "days"}</p>
          </div>
        </div>

        <div className="bg-white/20 rounded-full h-4 mb-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-white rounded-full"
          />
        </div>
        <div className={`flex justify-between text-sm font-bold ${isRTL ? "flex-row-reverse" : ""}`}>
          <span>{challenge.current_value || 0} / {challenge.target_value}</span>
          <span>{progress}%</span>
        </div>

        {challenge.reward_description && (
          <div className="mt-3 bg-white/20 rounded-2xl px-4 py-2 text-center">
            <span className="text-lg">🎁 </span>
            <span className="font-bold text-sm">{challenge.reward_description}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}