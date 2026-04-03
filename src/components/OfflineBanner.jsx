import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBack, setShowBack] = useState(false);
  const { isRTL } = useLanguage();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBack(true);
      setTimeout(() => setShowBack(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBack(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(!isOnline || showBack) && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-3 px-4 text-white text-sm font-bold shadow-lg ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              {isRTL ? "החיבור חזר ✓" : "Back online ✓"}
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              {isRTL ? "אין חיבור לאינטרנט" : "No internet connection"}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}