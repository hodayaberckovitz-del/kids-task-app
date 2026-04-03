import React from "react";
import { motion } from "framer-motion";
import { Users, Check, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/shared/Icon";
import { useLanguage } from "@/components/LanguageContext";

export default function SharedTaskCard({ task, currentProfile, allChildren, completedToday, onComplete }) {
  const { isRTL } = useLanguage();

  const sharedIds = task.shared_child_ids || [];
  const relevantChildren = allChildren.filter(c => sharedIds.includes(c.id));
  
  // Who completed this task today
  const completedByIds = completedToday
    .filter(c => c.task_id === task.id)
    .map(c => c.child_profile_id);

  const myCompleted = completedByIds.includes(currentProfile.id);
  const allCompleted = sharedIds.every(id => completedByIds.includes(id));
  const completedCount = sharedIds.filter(id => completedByIds.includes(id)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: myCompleted ? 1 : 1.03 }}
    >
      <Card
        className={`border-2 shadow-lg cursor-pointer transition-all relative overflow-hidden ${
          allCompleted
            ? "border-green-400 bg-green-50 opacity-80"
            : myCompleted
            ? "border-blue-300 bg-blue-50"
            : "border-purple-300 bg-white hover:border-purple-500"
        }`}
        onClick={() => !myCompleted && onComplete(task)}
      >
        {/* Group banner */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 flex items-center gap-2">
          <Users className="w-3 h-3 text-white" />
          <span className="text-xs text-white font-bold">
            {isRTL ? "משימה משותפת" : "Shared Task"}
          </span>
          <span className="text-xs text-white/80 mr-auto">
            {completedCount}/{sharedIds.length}
          </span>
        </div>

        <CardContent className="pt-8 pb-4 px-4">
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: task.color || "#8B5CF6" }}
            >
              <Icon name={task.icon} className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-gray-800 ${myCompleted ? "line-through text-gray-500" : ""}`}>
                {task.title}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {relevantChildren.map(child => {
                  const done = completedByIds.includes(child.id);
                  return (
                    <span
                      key={child.id}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {done ? "✓ " : "○ "}{child.name}
                    </span>
                  );
                })}
              </div>
            </div>
            {myCompleted && (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
            {!myCompleted && (
              <Badge className="bg-purple-100 text-purple-700 text-xs flex-shrink-0">
                🪙 {task.base_tokens || 1}
              </Badge>
            )}
          </div>

          {allCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 text-center bg-green-100 rounded-xl py-2 text-green-700 font-bold text-sm"
            >
              🎉 {isRTL ? "כל הקבוצה סיימה!" : "All done!"}
            </motion.div>
          )}

          {!allCompleted && myCompleted && (
            <div className="mt-2 text-center text-blue-600 text-xs font-medium">
              <Clock className="w-3 h-3 inline mr-1" />
              {isRTL ? "ממתין לשאר הילדים..." : "Waiting for others..."}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}