import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(null);
  const THRESHOLD = 80;

  useEffect(() => {
    const handleTouchStart = (e) => {
      // Only activate when page is scrolled to top
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (startYRef.current === null || isRefreshing) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(delta * 0.4, THRESHOLD + 20));
      } else {
        setPullDistance(0);
        startYRef.current = null;
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(0);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        setPullDistance(0);
      }
      startYRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

  return (
    <div className="relative">
      <AnimatePresence>
        {(pullDistance > 10 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 right-0 flex justify-center z-40 pointer-events-none"
          >
            <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg">
              <RefreshCw className={`w-6 h-6 text-purple-600 dark:text-purple-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}