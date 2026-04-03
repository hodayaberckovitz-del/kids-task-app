import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Icon from "./shared/Icon";
import { useLanguage } from "@/components/LanguageContext";

export default function TimerTaskCard({ task, isCompleted, onComplete, displayMode, className = "" }) {
  const [timeLeft, setTimeLeft] = useState(task.duration_minutes * 60); // בשניות
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { t } = useLanguage();
  const isVisualMode = displayMode === 'visual_large';

  useEffect(() => {
    let interval = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(task.duration_minutes * 60);
  };

  const handleComplete = async () => {
    if (!isFinished || isAnimating) return;

    setIsAnimating(true);

    // Add haptic feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([80, 50, 80, 50, 80]);
    }

    await onComplete(task, false, isCompleted);

    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((task.duration_minutes * 60 - timeLeft) / (task.duration_minutes * 60)) * 100;

  if (isVisualMode) {
    // Visual Mode - Large display
    return (
      <motion.div
        className={`relative p-6 rounded-3xl shadow-lg select-none ${className}`}
        style={{
          backgroundColor: task.color + "20",
          borderColor: isCompleted ? "#10B981" : (isFinished ? "#059669" : task.color + "40"),
          border: "2px solid"
        }}
        whileHover={{ scale: isCompleted ? 1 : 1.02 }}
        animate={isAnimating ? {
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{ duration: 0.6 }}
      >
        {isCompleted && (
          <motion.div
            className="absolute inset-0 bg-green-500/20 rounded-3xl flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>
        )}

        <div className={`text-center ${isCompleted ? 'opacity-50' : ''}`}>
          {task.visual_image_url ? (
            <motion.div
              className="w-full h-48 mb-4 rounded-2xl overflow-hidden relative"
              animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
            >
              <img
                src={task.visual_image_url}
                alt={task.title}
                className="w-full h-full object-cover"
              />
              {/* Progress Ring Overlay */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.3s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center relative"
              style={{ backgroundColor: task.color }}
              animate={isRunning ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
            >
              <Icon name={task.icon} className="w-16 h-16 text-white" />

              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="3"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
            </motion.div>
          )}

          <h3 className="text-2xl font-bold text-gray-800 mb-3">{task.title}</h3>

          <div className="mb-4">
            <div className="text-5xl font-mono font-bold text-gray-800 mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-base text-gray-600">
              {task.duration_minutes} {t('minutes')}
            </div>
          </div>

          {!isCompleted && (
            <>
              <div className="flex justify-center gap-3 mb-4">
                {!isRunning && !isFinished && (
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full w-16 h-16"
                  >
                    <Play className="w-8 h-8" />
                  </Button>
                )}

                {isRunning && (
                  <Button
                    onClick={handlePause}
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-16 h-16"
                  >
                    <Pause className="w-8 h-8" />
                  </Button>
                )}

                <Button
                  onClick={handleReset}
                  size="lg"
                  variant="outline"
                  className="rounded-full w-16 h-16"
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
              </div>

              {isFinished && (
                <Button
                  onClick={handleComplete}
                  className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full h-14 text-xl font-bold"
                >
                  🎉 {t('finishedTimer')}!
                </Button>
              )}

              <div className="text-base text-gray-600 mt-3">
                <div className="font-medium">🪙 {task.timed_tokens}</div>
              </div>
            </>
          )}

          {isCompleted && (
            <motion.div
              className="text-lg text-green-600 font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ✅ {t('completedSuccessfully')}!
            </motion.div>
          )}
        </div>

        {isAnimating && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-green-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos(i * 45 * Math.PI / 180) * 60,
                  y: Math.sin(i * 45 * Math.PI / 180) * 60,
                }}
                transition={{ duration: 1, delay: i * 0.1 }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Standard Text Mode (original code)
  return (
    <motion.div
      className={`relative p-4 rounded-3xl shadow-lg select-none ${className}`}
      style={{
        backgroundColor: task.color + "20",
        borderColor: isCompleted ? "#10B981" : (isFinished ? "#059669" : task.color + "40"),
        border: "2px solid"
      }}
      whileHover={{ scale: isCompleted ? 1 : 1.02 }}
      animate={isAnimating ? {
        scale: [1, 1.15, 1.05, 1],
        rotate: [0, -3, 3, 0],
        boxShadow: [
          '0 10px 30px rgba(16, 185, 129, 0.3)',
          '0 20px 60px rgba(16, 185, 129, 0.6)',
          '0 10px 30px rgba(16, 185, 129, 0.3)'
        ]
      } : {}}
      transition={{ duration: 1 }}
    >
      {/* Completion Overlay */}
      {isCompleted && (
        <motion.div
          className="absolute inset-0 bg-green-500/20 rounded-3xl flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 10,
              delay: 0.1
            }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-2xl"
          >
            <Check className="w-10 h-10 text-white stroke-[3]" />
          </motion.div>
        </motion.div>
      )}

      <div className={`text-center ${isCompleted ? 'opacity-50' : ''}`}>
        {/* Icon */}
        <motion.div
          className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center relative"
          style={{ backgroundColor: task.color }}
          animate={isRunning ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
        >
          <Icon name={task.icon} className="w-8 h-8 text-white" />

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />
          </svg>
        </motion.div>

        <h3 className="text-sm font-bold text-gray-800 mb-2">{task.title}</h3>

        {/* Timer Display */}
        <div className="mb-3">
          <div className="text-2xl font-mono font-bold text-gray-800 mb-1">
            {formatTime(timeLeft)}
          </div>
          <div className="text-xs text-gray-600">
            {task.duration_minutes} {t('minutes')}
          </div>
        </div>

        {!isCompleted && (
          <>
            {/* Control Buttons */}
            <div className="flex justify-center gap-2 mb-3">
              {!isRunning && !isFinished && (
                <Button
                  onClick={handleStart}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full w-8 h-8 p-0"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}

              {isRunning && (
                <Button
                  onClick={handlePause}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-8 h-8 p-0"
                >
                  <Pause className="w-4 h-4" />
                </Button>
              )}

              <Button
                onClick={handleReset}
                size="sm"
                variant="outline"
                className="rounded-full w-8 h-8 p-0"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>

            {/* Complete Button */}
            {isFinished && (
              <Button
                onClick={handleComplete}
                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full"
              >
                🎉 {t('finishedTimer')}!
              </Button>
            )}

            {/* Tokens Display */}
            <div className="text-xs text-gray-600">
              <div className="font-medium">🪙 {task.timed_tokens} {t('tokens')}</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                <span>{t('timedTask')}</span>
              </div>
            </div>
          </>
        )}

        {isCompleted && (
          <motion.div
            className="text-sm text-green-600 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✅ {t('completedSuccessfully')}!
          </motion.div>
        )}
      </div>

      {/* Success Animation */}
      {isAnimating && (
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-green-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                x: Math.cos(i * 30 * Math.PI / 180) * 70,
                y: Math.sin(i * 30 * Math.PI / 180) * 70,
              }}
              transition={{ duration: 1.2, delay: i * 0.06 }}
            />
          ))}

          {/* Check marks flying out */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`check-${i}`}
              className="absolute"
              style={{ left: '50%', top: '50%' }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
                x: Math.cos(i * 60 * Math.PI / 180) * 50,
                y: Math.sin(i * 60 * Math.PI / 180) * 50,
              }}
              transition={{ duration: 1, delay: i * 0.1 }}
            >
              <Check className="w-6 h-6 text-green-500" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}