import React from "react";
import { motion } from "framer-motion";

function SkeletonBlock({ className }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-white/60 rounded-2xl ${className}`}
    />
  );
}

function TaskSkeleton() {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 flex items-center gap-4 shadow-md">
      <SkeletonBlock className="w-14 h-14 rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-5 w-3/4" />
        <SkeletonBlock className="h-4 w-1/2" />
      </div>
      <SkeletonBlock className="w-10 h-10 rounded-full flex-shrink-0" />
    </div>
  );
}

function SectionSkeleton({ taskCount = 3 }) {
  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-5 shadow-lg space-y-3">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBlock className="w-10 h-10 rounded-xl" />
        <SkeletonBlock className="h-6 w-40" />
      </div>
      {[...Array(taskCount)].map((_, i) => (
        <TaskSkeleton key={i} />
      ))}
    </div>
  );
}

export default function DashboardSkeleton({ backgroundGradient = "from-purple-400 via-pink-400 to-yellow-300" }) {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient}`}>
      {/* Header Skeleton */}
      <div className="bg-white/20 backdrop-blur-sm p-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <SkeletonBlock className="h-6 w-36" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
          </div>
          <SkeletonBlock className="w-24 h-10 rounded-2xl" />
        </div>

        {/* Token counter skeleton */}
        <div className="flex justify-center">
          <SkeletonBlock className="h-16 w-48 rounded-3xl" />
        </div>
      </div>

      {/* Progress bar skeleton */}
      <div className="mx-4 my-4">
        <SkeletonBlock className="h-8 w-full rounded-2xl" />
      </div>

      {/* Task sections skeleton */}
      <div className="px-4 space-y-4 pb-24">
        <SectionSkeleton taskCount={3} />
        <SectionSkeleton taskCount={2} />
        <SectionSkeleton taskCount={2} />
      </div>
    </div>
  );
}