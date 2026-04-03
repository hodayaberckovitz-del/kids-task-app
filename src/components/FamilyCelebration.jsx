import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function FamilyCelebration({ show, message, onClose }) {
  useEffect(() => {
    if (show) {
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
      const t = setTimeout(onClose, 5000);
      return () => clearTimeout(t);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.3, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.3 }}
            className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-[3rem] p-10 text-center shadow-2xl max-w-sm"
          >
            <motion.div
              animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, repeat: 4 }}
              className="text-8xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-4xl font-black text-white drop-shadow-lg mb-3">
              כל הכבוד!
            </h2>
            <p className="text-xl text-white font-bold">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}