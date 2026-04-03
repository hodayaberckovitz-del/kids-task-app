import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(null);
  const containerRef = useRef(null);
  const THRESHOLD = 80;

  const handleTouchStart = (e) => {
    // Only activate pull-to-refresh when scrolled to top
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (startYRef.current === null || isRefreshing) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      setPullDistance(Math.min(delta * 0.4, THRESHOLD + 20));
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

  return (
    <div
      ref={containerRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {(pullDistance > 10 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-2 left-0 right-0 flex justify-center z-10 pointer-events-none"
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