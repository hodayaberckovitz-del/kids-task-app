/**
 * AgeGroupWrapper - Provides age-group-aware styling
 * Usage: wrap components or sections with this to get age-specific classes
 */
import React from "react";

export function getAgeGroup(profile) {
  if (!profile) return "middle";
  if (profile.age_group) return profile.age_group;
  const age = profile.age || 10;
  if (age <= 7) return "young";
  if (age <= 12) return "middle";
  return "teen";
}

export function useAgeGroupClasses(ageGroup) {
  switch (ageGroup) {
    case "young":
      return {
        taskCard: "min-h-[120px] text-xl",
        icon: "w-20 h-20 text-4xl",
        text: "text-2xl font-black",
        container: "gap-6",
        hideStats: true,
        hideLeaderboard: true,
        tokenLabel: "⭐⭐⭐", // stars instead of numbers
        bigAnimations: true,
      };
    case "teen":
      return {
        taskCard: "min-h-[60px] text-sm",
        icon: "w-8 h-8 text-lg",
        text: "text-base font-medium",
        container: "gap-2",
        hideStats: false,
        hideLeaderboard: false,
        tokenLabel: "נקודות",
        bigAnimations: false,
        minimalDesign: true,
      };
    default: // middle
      return {
        taskCard: "",
        icon: "w-12 h-12",
        text: "text-lg font-bold",
        container: "gap-4",
        hideStats: false,
        hideLeaderboard: false,
        tokenLabel: "אסימונים",
        bigAnimations: true,
      };
  }
}

export default function AgeGroupWrapper({ profile, children }) {
  const ageGroup = getAgeGroup(profile);
  return (
    <div data-age-group={ageGroup} className={ageGroup === "teen" ? "teen-mode" : ageGroup === "young" ? "young-mode" : ""}>
      {children}
    </div>
  );
}