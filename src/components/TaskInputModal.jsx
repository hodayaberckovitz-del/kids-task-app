import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "./shared/Icon";
import { useLanguage } from "@/components/LanguageContext";

export default function TaskInputModal({ isOpen, onClose, onComplete, task }) {
  const [inputValue, setInputValue] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) {
      // Reset input when modal is closed
      setTimeout(() => setInputValue(""), 300);
    }
  }, [isOpen]);

  if (!task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onComplete(task, inputValue.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 text-center max-w-md w-full mx-4 relative"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 -mt-16 border-4 border-white"
              style={{ backgroundColor: task.color }}
            >
              <Icon name={task.icon || "Edit3"} className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {task.input_label || task.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {task.description || t('tellUsAbout')}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="task-input" className="sr-only">
                  {t('enterTextHere')}
                </Label>
                <Input
                  id="task-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('enterTextHere')}
                  className="text-center text-lg h-12"
                  autoFocus
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  {t('save')}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}