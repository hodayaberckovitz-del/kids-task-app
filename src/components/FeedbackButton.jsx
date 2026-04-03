import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/components/LanguageContext";

export default function FeedbackButton() {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSending(true);
    try {
      const user = await base44.auth.me();
      
      await base44.integrations.Core.SendEmail({
        to: "hodaya.berckovitz@gmail.com",
        subject: `משוב מאפליקציה - ${user.email}`,
        body: `משוב מ: ${user.email}\nאימייל נוסף: ${email || 'לא סופק'}\n\n${feedback}`
      });

      setShowSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setFeedback("");
        setEmail("");
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error sending feedback:", error);
      alert(t('errorSavingSettings'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </motion.button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {showSuccess ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-6xl mb-4"
                  >
                    ✅
                  </motion.div>
                  <h3 className="text-2xl font-bold text-green-600">
                    {t('thankYouFeedback')}
                  </h3>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">
                      💬 {t('sendFeedback')}
                    </h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        {t('email')} ({isRTL ? 'אופציונלי' : 'optional'})
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        {t('yourFeedback')}
                      </label>
                      <Textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder={t('feedbackPlaceholder')}
                        rows={5}
                        required
                        className="resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSending || !feedback.trim()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 h-12 text-lg"
                    >
                      {isSending ? (
                        <>{t('sending')}</>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          {t('sendFeedback')}
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}