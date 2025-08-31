// Activity-Based Income Predictor - Design System
// Anthropic-inspired cloud minimalism

export const Colors = {
  // Primary Palette
  primaryBlue: '#4A90E2',
  cloudWhite: '#FBFBFB',
  mistGray: '#E8EAED',
  shadowGray: '#9AA0A6',
  skyBlue: '#E3F2FD', // Added for timeline background
  
  // Status Colors
  successGreen: '#34A853',
  warningAmber: '#FF9500',
  dangerRed: '#EA4335',
  premiumGold: '#F9AB00',
  
  // Gradients
  skyGradient: ['#4A90E2', '#FBFBFB'] as const,
  cloudGradient: ['#FBFBFB', '#E8EAED'] as const,
  
  // Value-based colors
  highValue: '#34A853',
  mediumValue: '#4A90E2',
  lowValue: '#9AA0A6',
  negativeValue: '#EA4335',
  
  // Activity categories
  ceoLevel: '#F9AB00',
  executive: '#4A90E2',
  professional: '#34A853',
  basic: '#9AA0A6',
  incomeKiller: '#EA4335'
};

export const Typography = {
  displayLarge: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40
  },
  headline: {
    fontSize: 24,
    fontWeight: '500' as const,
    lineHeight: 32
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  full: 999
};

export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  }
};

export const getValueColor = (value: number): string => {
  if (value < 0) return Colors.negativeValue;
  if (value === 0) return Colors.shadowGray;
  if (value < 1000) return Colors.lowValue;
  if (value < 10000) return Colors.mediumValue;
  if (value < 200000) return Colors.highValue; // ₹2L
  return Colors.premiumGold; // CEO level
};

export const getActivityLevelColor = (value: number): string => {
  if (value < 0) return Colors.incomeKiller;
  if (value < 2000) return Colors.basic;
  if (value < 20000) return Colors.professional;
  if (value < 200000) return Colors.executive;
  return Colors.ceoLevel;
};