import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { format, startOfWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/LanguageContext";
import { Trophy } from "lucide-react";

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600"];

export default function Leaderboard({ familyId, currentProfileId }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isRTL } = useLanguage();

  useEffect(() => {
    if (!familyId) return;
    loadLeaderboard();
  }, [familyId]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd");

      const [children, completions] = await Promise.all([
        base44.entities.ChildProfile.filter({ family_id: familyId }),
        base44.entities.TaskCompletion.filter({ family_id: familyId })
      ]);

      const activeChildren = children.filter(c => !c.is_adult);

      const data = activeChildren.map(child => {
        const weekCompletions = completions.filter(
          c => c.child_profile_id === child.id && c.completed_date >= weekStart
        );
        const weekTokens = weekCompletions.reduce((sum, c) => sum + (c.tokens_earned || 0), 0);
        return {
          child,
          taskCount: weekCompletions.length,
          tokens: weekTokens
        };
      });

      data.sort((a, b) => b.taskCount - a.taskCount || b.tokens - a.tokens);
      setEntries(data);
    } catch (e) {
      console.error("Leaderboard error", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || entries.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? "flex-row-reverse" : ""}`}>
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>{isRTL ? "לוח מובילים השבוע 🏆" : "This Week's Leaderboard 🏆"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <AnimatePresence>
              {entries.map((entry, idx) => {
                const isMe = entry.child.id === currentProfileId;
                return (
                  <motion.div
                    key={entry.child.id}
                    layout
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                      isMe
                        ? "bg-purple-100 border-2 border-purple-300"
                        : "bg-white/70 border border-yellow-100"
                    } ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span className={`text-2xl w-8 text-center flex-shrink-0 ${MEDAL_COLORS[idx] || "text-gray-400"}`}>
                      {idx < 3 ? MEDALS[idx] : `${idx + 1}.`}
                    </span>

                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {entry.child.name.charAt(0)}
                    </div>

                    <div className={`flex-1 min-w-0 ${isRTL ? "text-right" : ""}`}>
                      <p className="font-bold text-gray-800 text-sm truncate">
                        {entry.child.name} {isMe && (isRTL ? "(אני)" : "(me)")}
                      </p>
                    </div>

                    <div className={`flex items-center gap-3 flex-shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="text-center">
                        <p className="text-lg font-black text-purple-700">{entry.taskCount}</p>
                        <p className="text-xs text-gray-500">{isRTL ? "משימות" : "tasks"}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-black text-yellow-600">🪙{entry.tokens}</p>
                        <p className="text-xs text-gray-500">{isRTL ? "אסימונים" : "tokens"}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}