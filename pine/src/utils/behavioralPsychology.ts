// Behavioral Psychology Features
// Progressive unlocking, achievements, and smart suggestions

import { Activity, TimeSlot } from '../types';

export interface UserStats {
  totalHours: number;
  negativeHours: number;
  highValueHours: number; // ₹10K+
  executiveHours: number; // ₹2L+
  ceoHours: number; // ₹20L+
  consistencyStreak: number;
  averageDailyValue: number;
  topCategories: string[];
}

export interface UnlockStatus {
  ceoLevelUnlocked: boolean;
  executiveUnlocked: boolean;
  premiumActivitiesCount: number;
  warningMessage?: string;
  nextUnlockMessage?: string;
  currentLevel: 'BASIC' | 'PROFESSIONAL' | 'EXECUTIVE' | 'CEO';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  category: 'VALUE' | 'CONSISTENCY' | 'ELIMINATION';
}

export const calculateUserStats = (timeSlots: TimeSlot[]): UserStats => {
  const activitiesWithValue = timeSlots.filter(slot => slot.activity);
  
  return {
    totalHours: activitiesWithValue.length * 0.5, // 30-min slots
    negativeHours: activitiesWithValue.filter(slot => slot.value < 0).length * 0.5,
    highValueHours: activitiesWithValue.filter(slot => slot.value >= 10000).length * 0.5,
    executiveHours: activitiesWithValue.filter(slot => slot.value >= 200000).length * 0.5,
    ceoHours: activitiesWithValue.filter(slot => slot.value >= 2000000).length * 0.5,
    consistencyStreak: 0, // Calculated separately
    averageDailyValue: activitiesWithValue.reduce((sum, slot) => sum + slot.value, 0),
    topCategories: [] // Calculated from activity categories
  };
};

export const calculateUnlockStatus = (userStats: UserStats): UnlockStatus => {
  const executiveUnlocked = userStats.negativeHours <= 2.5 && userStats.highValueHours >= 5;
  const ceoLevelUnlocked = userStats.negativeHours <= 1 && userStats.executiveHours >= 2;
  
  let currentLevel: 'BASIC' | 'PROFESSIONAL' | 'EXECUTIVE' | 'CEO' = 'BASIC';
  if (ceoLevelUnlocked) currentLevel = 'CEO';
  else if (executiveUnlocked) currentLevel = 'EXECUTIVE';
  else if (userStats.negativeHours <= 5) currentLevel = 'PROFESSIONAL';
  
  let warningMessage: string | undefined;
  let nextUnlockMessage: string | undefined;
  
  if (userStats.negativeHours > 5) {
    warningMessage = "Eliminate income killers to unlock higher levels";
  } else if (!executiveUnlocked) {
    nextUnlockMessage = `Need ${Math.max(0, 5 - userStats.highValueHours)} more high-value hours to unlock Executive level`;
  } else if (!ceoLevelUnlocked) {
    nextUnlockMessage = `Need ${Math.max(0, 2 - userStats.executiveHours)} more executive hours to unlock CEO level`;
  }
  
  return {
    ceoLevelUnlocked,
    executiveUnlocked,
    premiumActivitiesCount: userStats.highValueHours,
    warningMessage,
    nextUnlockMessage,
    currentLevel
  };
};

export const getSmartSuggestions = (
  currentTime: Date, 
  userHistory: TimeSlot[], 
  allActivities: Activity[]
): Activity[] => {
  const timeOfDay = currentTime.getHours();
  
  // Filter activities based on time and unlock status
  let availableActivities = allActivities.filter(activity => {
    // During work hours (9 AM - 6 PM), prefer professional activities
    if (timeOfDay >= 9 && timeOfDay <= 18) {
      return activity.hourlyValue >= 500; // Minimum value during work hours
    }
    return activity.hourlyValue >= 0; // Avoid negative activities
  });
  
  // Sort by value (highest first) and limit to top suggestions
  return availableActivities
    .sort((a, b) => b.hourlyValue - a.hourlyValue)
    .slice(0, 8);
};

export const getContextualNotification = (userStats: UserStats) => {
  if (userStats.negativeHours > 5) {
    return {
      title: "⚠️ Income Alert",
      body: `You're losing ₹${Math.round(userStats.negativeHours * 2 * 250)}K annually. Ready to change course?`,
      action: "ELIMINATE_NEGATIVES"
    };
  }
  
  if (userStats.highValueHours > 10) {
    return {
      title: "🎯 Level Up Available!",
      body: "You've earned access to Executive-level activities ✨",
      action: "UNLOCK_PREMIUM"
    };
  }
  
  return null;
};

export const calculateAchievements = (userStats: UserStats): Achievement[] => {
  return [
    {
      id: 'high_value_hunter',
      title: '✨ High-Value Hunter',
      description: 'Complete 20 hours of ₹10K+ activities',
      icon: '✨',
      progress: userStats.highValueHours,
      maxProgress: 20,
      unlocked: userStats.highValueHours >= 20,
      category: 'VALUE'
    },
    {
      id: 'income_killer_slayer',
      title: '🚫 Income Killer Slayer',
      description: 'Eliminate all negative activities',
      icon: '🚫',
      progress: Math.max(0, 10 - userStats.negativeHours),
      maxProgress: 10,
      unlocked: userStats.negativeHours === 0,
      category: 'ELIMINATION'
    },
    {
      id: 'consistency_king',
      title: '💰 Consistency King',
      description: '₹5K+ daily for 30 days straight',
      icon: '💰',
      progress: userStats.consistencyStreak,
      maxProgress: 30,
      unlocked: userStats.consistencyStreak >= 30,
      category: 'CONSISTENCY'
    },
    {
      id: 'executive_mindset',
      title: '🎯 Executive Mindset',
      description: 'Complete 10 hours of Executive-level activities',
      icon: '🎯',
      progress: userStats.executiveHours,
      maxProgress: 10,
      unlocked: userStats.executiveHours >= 10,
      category: 'VALUE'
    }
  ];
};

export const getActivityCategoryInfo = (hourlyValue: number) => {
  if (hourlyValue >= 2000000) {
    return {
      level: 'CEO LEVEL',
      range: '₹20L-₹100Cr/activity',
      color: '#F9AB00',
      icon: '👑',
      isLocked: false // Determined by unlock status
    };
  } else if (hourlyValue >= 200000) {
    return {
      level: 'EXECUTIVE',
      range: '₹2L-₹20L/activity',
      color: '#4A90E2',
      icon: '📈',
      isLocked: false
    };
  } else if (hourlyValue >= 2000) {
    return {
      level: 'PROFESSIONAL',
      range: '₹2K-₹20K/activity',
      color: '#34A853',
      icon: '💼',
      isLocked: false
    };
  } else if (hourlyValue >= 0) {
    return {
      level: 'BASIC',
      range: '₹0-₹2K/activity',
      color: '#9AA0A6',
      icon: '📝',
      isLocked: false
    };
  } else {
    return {
      level: 'INCOME KILLERS',
      range: 'Negative Value',
      color: '#EA4335',
      icon: '❌',
      isLocked: false
    };
  }
};