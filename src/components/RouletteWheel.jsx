import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from './LanguageContext';
import confetti from 'canvas-confetti';

export default function RouletteWheel({ onFinish, age = 7 }) {
  const { t } = useLanguage();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const wheelRef = useRef(null);

  // Adjust prizes based on age
  const getPrizesByAge = () => {
    if (age <= 5) {
      // Young kids - smaller range, all wins
      return [3, 3, 4, 4, 5, 5, 5];
    } else if (age <= 8) {
      // Medium kids - some losses
      return [0, 2, 3, 3, 4, 5, 5];
    } else {
      // Older kids - more variety and risk
      return [0, 0, 2, 3, 4, 5, 5];
    }
  };

  const prizes = getPrizesByAge();
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Random selection
    const winningIndex = Math.floor(Math.random() * prizes.length);
    const prize = prizes[winningIndex];

    // Calculate rotation to land on winning segment
    const segmentAngle = 360 / prizes.length;
    const targetAngle = 360 * 5 + (winningIndex * segmentAngle) + (segmentAngle / 2);
    
    setRotation(targetAngle);

    // After animation completes
    setTimeout(() => {
      setResult(prize);
      setIsSpinning(false);
      
      // Show confetti if won
      if (prize > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      // Wait a bit for user to see result, then call onFinish
      setTimeout(() => {
        onFinish(prize > 0, prize);
      }, 2000);
    }, 4000);
  };

  const segmentAngle = 360 / prizes.length;

  return (
    <div className="flex flex-col items-center">
      {/* Pointer */}
      <motion.div 
        className="relative z-10 mb-[-20px]"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      >
        <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-500 drop-shadow-xl" />
      </motion.div>

      {/* Wheel */}
      <motion.div
        ref={wheelRef}
        className="relative w-80 h-80 rounded-full border-8 border-yellow-400 shadow-2xl overflow-hidden"
        style={{ 
          rotate: rotation,
        }}
        transition={{ 
          duration: 4, 
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {prizes.map((prize, index) => {
            const angle = segmentAngle * index;
            const nextAngle = segmentAngle * (index + 1);
            
            const startX = 50 + 45 * Math.cos((angle - 90) * Math.PI / 180);
            const startY = 50 + 45 * Math.sin((angle - 90) * Math.PI / 180);
            const endX = 50 + 45 * Math.cos((nextAngle - 90) * Math.PI / 180);
            const endY = 50 + 45 * Math.sin((nextAngle - 90) * Math.PI / 180);
            
            const largeArc = segmentAngle > 180 ? 1 : 0;
            
            return (
              <g key={index}>
                <path
                  d={`M 50 50 L ${startX} ${startY} A 45 45 0 ${largeArc} 1 ${endX} ${endY} Z`}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="0.5"
                />
                <text
                  x="50"
                  y="50"
                  transform={`rotate(${angle + segmentAngle / 2} 50 50) translate(0 -25)`}
                  textAnchor="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="0.5"
                >
                  {prize === 0 ? '😢' : `${prize}🪙`}
                </text>
              </g>
            );
          })}

        </svg>

        {/* Center circle with spin button */}
        <div className="absolute inset-0 m-auto w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
          <motion.button
            onClick={spinWheel}
            disabled={isSpinning}
            className="text-4xl hover:scale-110 transition-transform disabled:opacity-50 font-bold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isSpinning ? '🔄' : '🎯'}
          </motion.button>
        </div>
      </motion.div>

      {/* Result Display */}
      <AnimatePresence>
        {result !== null && !isSpinning && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="mt-6 text-center"
          >
            <div className={`text-6xl font-bold ${result > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {result > 0 ? `+${result} 🪙` : '😢'}
            </div>
            <div className="text-xl mt-2 text-gray-600">
              {result > 0 ? 'זכית!' : 'נסה שוב בפעם הבאה'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}