import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/LanguageContext";

export default function InstallPWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const { isRTL } = useLanguage();

  useEffect(() => {
    // Don't show if already dismissed or installed
    const dismissed = localStorage.getItem('pwa_banner_dismissed');
    if (dismissed) return;

    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-200 p-4 flex items-center gap-3">
            <div className="text-3xl flex-shrink-0">⭐</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 text-sm">
                {isRTL ? 'התקן את כוכב המשימות!' : 'Install Task Star!'}
              </p>
              <p className="text-xs text-gray-500">
                {isRTL ? 'הוסף למסך הבית לגישה מהירה' : 'Add to home screen for quick access'}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" onClick={handleInstall} className="bg-purple-600 hover:bg-purple-700 text-xs px-3">
                {isRTL ? 'התקן' : 'Install'}
              </Button>
              <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}