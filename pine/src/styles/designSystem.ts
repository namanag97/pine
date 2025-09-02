// Pine App - Production-Ready Design System
// Comprehensive design tokens for consistent visual hierarchy

import { TextStyle, ViewStyle } from 'react-native';

// ============================================================================
// COLOR SYSTEM
// ============================================================================

export const Colors = {
  // Primary Palette (Blue) - 9 shades
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB', 
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main brand color
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1'
  },

  // Neutral Palette - 11 shades for text/background hierarchy
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    950: '#0A0A0A'
  },

  // Success Palette (Green)
  success: {
    50: '#E8F5E8',
    100: '#C8E6C8',
    200: '#A5D6A5',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main success color
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20'
  },

  // Warning Palette (Amber)
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Main warning color
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00'
  },

  // Error Palette (Red)
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Main error color
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C'
  },

  // Premium Palette (Gold)
  premium: {
    50: '#FFFDE7',
    100: '#FFF9C4',
    200: '#FFF59D',
    300: '#FFF176',
    400: '#FFEE58',
    500: '#FFEB3B',
    600: '#FDD835',
    700: '#FBC02D',
    800: '#F9A825',
    900: '#F57F17'
  }
} as const;

// Semantic Color Tokens
export const SemanticColors = {
  // Text Colors
  text: {
    primary: Colors.neutral[900],
    secondary: Colors.neutral[600],
    tertiary: Colors.neutral[500],
    disabled: Colors.neutral[400],
    inverse: Colors.neutral[0],
    link: Colors.primary[600],
    error: Colors.error[600],
    success: Colors.success[600],
    warning: Colors.warning[700]
  },

  // Background Colors
  background: {
    primary: Colors.neutral[0],
    secondary: Colors.neutral[50],
    tertiary: Colors.neutral[100],
    elevated: Colors.neutral[0],
    overlay: Colors.neutral[900] + '80', // 50% opacity
    disabled: Colors.neutral[200]
  },

  // Surface Colors (for cards, containers)
  surface: {
    primary: Colors.neutral[0],
    secondary: Colors.neutral[50],
    tertiary: Colors.neutral[100],
    elevated: Colors.neutral[0],
    hover: Colors.neutral[50],
    pressed: Colors.neutral[100],
    selected: Colors.primary[50],
    disabled: Colors.neutral[100]
  },

  // Border Colors
  border: {
    primary: Colors.neutral[200],
    secondary: Colors.neutral[300],
    hover: Colors.neutral[400],
    focus: Colors.primary[500],
    error: Colors.error[500],
    disabled: Colors.neutral[200]
  },

  // Activity Value Colors (Based on hourly value ranges)
  activityValue: {
    ceoLevel: Colors.premium[600],      // ₹2,000,000+
    executive: Colors.primary[600],     // ₹200,000 - ₹2,000,000
    highValue: Colors.success[600],     // ₹20,000 - ₹200,000
    professional: Colors.primary[400],  // ₹2,000 - ₹20,000
    basic: Colors.neutral[500],         // ₹200 - ₹2,000
    lowValue: Colors.neutral[400],      // ₹0 - ₹200
    free: Colors.neutral[500],          // ₹0
    negative: Colors.error[500]         // < ₹0
  }
} as const;

// Background Gradients
export const Gradients = {
  skyGradient: [Colors.primary[500], Colors.neutral[50]] as const,
  cloudGradient: [Colors.neutral[0], Colors.neutral[100]] as const,
  premiumGradient: [Colors.premium[400], Colors.premium[600]] as const,
  successGradient: [Colors.success[400], Colors.success[600]] as const
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const FontFamily = {
  primary: 'Inter', // Updated to use Inter font family
  secondary: 'Inter', // Consistent Inter usage
  monospace: 'JetBrains Mono' // Updated monospace font
} as const;

export const FontWeight = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36
} as const;

export const LineHeight = {
  xs: 14,
  sm: 16,
  base: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
  '5xl': 44,
  '6xl': 48
} as const;

// Semantic Typography Styles
export const Typography = {
  // Display Text (for hero sections, large numbers)
  display: {
    fontSize: FontSize['6xl'],
    fontWeight: FontWeight.bold,
    lineHeight: LineHeight['6xl'],
    fontFamily: FontFamily.primary
  } as TextStyle,

  // Headings
  heading1: {
    fontSize: FontSize['5xl'],
    fontWeight: FontWeight.bold,
    lineHeight: LineHeight['5xl'],
    fontFamily: FontFamily.primary
  } as TextStyle,

  heading2: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeight.bold,
    lineHeight: LineHeight['4xl'],
    fontFamily: FontFamily.primary
  } as TextStyle,

  heading3: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.semiBold,
    lineHeight: LineHeight['3xl'],
    fontFamily: FontFamily.primary
  } as TextStyle,

  heading4: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.semiBold,
    lineHeight: LineHeight['2xl'],
    fontFamily: FontFamily.primary
  } as TextStyle,

  heading5: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semiBold,
    lineHeight: LineHeight.xl,
    fontFamily: FontFamily.primary
  } as TextStyle,

  heading6: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    lineHeight: LineHeight.lg,
    fontFamily: FontFamily.primary
  } as TextStyle,

  // Body Text
  bodyLarge: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.lg,
    fontFamily: FontFamily.primary
  } as TextStyle,

  bodyRegular: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.base,
    fontFamily: FontFamily.primary
  } as TextStyle,

  bodySmall: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.sm,
    fontFamily: FontFamily.primary
  } as TextStyle,

  // Specialized Text
  caption: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.xs,
    fontFamily: FontFamily.primary
  } as TextStyle,

  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: LineHeight.sm,
    fontFamily: FontFamily.primary
  } as TextStyle,

  button: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semiBold,
    lineHeight: LineHeight.base,
    fontFamily: FontFamily.primary
  } as TextStyle,

  // Numerical values (income, stats)
  numerical: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    lineHeight: LineHeight.lg,
    fontFamily: FontFamily.monospace
  } as TextStyle,

  numericalLarge: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    lineHeight: LineHeight['3xl'],
    fontFamily: FontFamily.monospace
  } as TextStyle
} as const;

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
  xxl: 32 // Add xxl as alias for 3xl
} as const;

// Layout Constants
export const Layout = {
  containerMaxWidth: 768,
  containerPadding: Spacing.lg,
  sectionSpacing: Spacing['4xl'],
  cardSpacing: Spacing.lg,
  listItemSpacing: Spacing.md
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

export const BorderRadius = {
  none: 0,
  sm: 4,
  small: 4, // Add small as alias for sm
  md: 8,
  lg: 12,
  large: 12, // Add large as alias for lg
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 999
} as const;

// ============================================================================
// SHADOW SYSTEM
// ============================================================================

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },
  
  soft: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  
  medium: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  
  large: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6
  },
  
  extraLarge: {
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10
  }
} as const;

// ============================================================================
// COMPONENT STYLE TOKENS
// ============================================================================

export const ComponentStyles = {
  // Button Styles
  button: {
    primary: {
      backgroundColor: Colors.primary[500],
      borderColor: Colors.primary[500],
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      minHeight: 48,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      ...Shadows.soft
    } as ViewStyle,

    secondary: {
      backgroundColor: 'transparent',
      borderColor: Colors.primary[500],
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      minHeight: 48,
      justifyContent: 'center' as const,
      alignItems: 'center' as const
    } as ViewStyle,

    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      minHeight: 48,
      justifyContent: 'center' as const,
      alignItems: 'center' as const
    } as ViewStyle,

    danger: {
      backgroundColor: Colors.error[500],
      borderColor: Colors.error[500],
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      minHeight: 48,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      ...Shadows.soft
    } as ViewStyle
  },

  // Card Styles
  card: {
    default: {
      backgroundColor: SemanticColors.surface.primary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      ...Shadows.soft
    } as ViewStyle,

    elevated: {
      backgroundColor: SemanticColors.surface.primary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      ...Shadows.medium
    } as ViewStyle,

    outlined: {
      backgroundColor: SemanticColors.surface.primary,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: SemanticColors.border.primary
    } as ViewStyle
  },

  // Input Styles
  input: {
    default: {
      backgroundColor: SemanticColors.surface.primary,
      borderWidth: 1,
      borderColor: SemanticColors.border.primary,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      minHeight: 48,
      fontSize: FontSize.base,
      fontFamily: FontFamily.primary
    } as ViewStyle,

    focused: {
      borderColor: SemanticColors.border.focus,
      borderWidth: 2,
      ...Shadows.soft
    } as ViewStyle,

    error: {
      borderColor: SemanticColors.border.error,
      borderWidth: 2
    } as ViewStyle
  }
} as const;

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const Animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  
  easing: {
    ease: 'ease' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
    easeInOut: 'ease-in-out' as const
  },

  scale: {
    press: 0.95,
    hover: 1.02
  }
} as const;

// ============================================================================
// TIMELINE DESIGN TOKENS
// ============================================================================

export const Timeline = {
  // Layout dimensions optimized for iPhone 14+ (428px width)
  timeLabel: {
    width: 80,
    fontSize: FontSize.sm,
    textAlign: 'right' as const,
    marginRight: Spacing.lg,
    fontWeight: FontWeight.medium
  },
  
  // Time slot spacing - larger for better touch targets on iPhone 14+
  slot: {
    minHeight: 68,
    marginBottom: Spacing.sm,
    cardPadding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    // Enhanced spacing for larger screen
    paddingHorizontal: Spacing.xl
  },
  
  // Activity card states with iPhone 14+ optimizations
  card: {
    empty: {
      backgroundColor: SemanticColors.surface.secondary,
      borderWidth: 2,
      borderColor: SemanticColors.border.primary,
      borderStyle: 'dashed' as const,
      minHeight: 68,
      justifyContent: 'center' as const,
      alignItems: 'center' as const
    },
    
    filled: {
      backgroundColor: SemanticColors.surface.primary,
      borderWidth: 1,
      borderColor: SemanticColors.border.primary,
      minHeight: 68,
      justifyContent: 'center' as const,
      ...Shadows.soft
    },
    
    hover: {
      transform: [{ translateY: -2 }],
      ...Shadows.medium
    }
  },
  
  // Mobile container optimized for iPhone 14+
  container: {
    maxWidth: 428, // iPhone 14+ width
    alignSelf: 'center' as const,
    flex: 1,
    backgroundColor: SemanticColors.background.primary,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 140 // Larger space for current activity bar
  },
  
  // Header styling for iPhone 14+
  header: {
    backgroundColor: SemanticColors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const
  },
  
  // Stats card styling for iPhone 14+
  statsCard: {
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden' as const,
    ...Shadows.large
  },
  
  // Current activity bar for iPhone 14+
  currentActivityBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: SemanticColors.surface.primary,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    ...Shadows.extraLarge
  }
} as const;

// ============================================================================
// ACTIVITY VALUE TIER SYSTEM
// ============================================================================

export const ActivityValueTiers = {
  ceoLevel: { threshold: 2000000, rank: 8 },
  executive: { threshold: 200000, rank: 7 },
  highValue: { threshold: 20000, rank: 6 },
  professional: { threshold: 2000, rank: 5 },
  basic: { threshold: 200, rank: 4 },
  lowValue: { threshold: 100, rank: 3 },
  free: { threshold: 0, rank: 2 },
  negative: { threshold: -Infinity, rank: 1 }
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getActivityValueColor = (value: number): string => {
  if (value >= 2000000) return SemanticColors.activityValue.ceoLevel;
  if (value >= 200000) return SemanticColors.activityValue.executive;
  if (value >= 20000) return SemanticColors.activityValue.highValue;
  if (value >= 2000) return SemanticColors.activityValue.professional;
  if (value >= 200) return SemanticColors.activityValue.basic;
  if (value > 0) return SemanticColors.activityValue.lowValue;
  if (value === 0) return SemanticColors.activityValue.free;
  return SemanticColors.activityValue.negative;
};

export const getActivityLevelInfo = (value: number) => {
  if (value >= 2000000) {
    return {
      level: 'CEO Level',
      color: SemanticColors.activityValue.ceoLevel,
      icon: '👑',
      description: 'Strategic leadership tasks'
    };
  }
  if (value >= 200000) {
    return {
      level: 'Executive',
      color: SemanticColors.activityValue.executive,
      icon: '📈',
      description: 'High-impact business activities'
    };
  }
  if (value >= 20000) {
    return {
      level: 'High Value',
      color: SemanticColors.activityValue.highValue,
      icon: '✨',
      description: 'Strategic and valuable tasks'
    };
  }
  if (value >= 2000) {
    return {
      level: 'Professional',
      color: SemanticColors.activityValue.professional,
      icon: '💼',
      description: 'Professional development'
    };
  }
  if (value >= 200) {
    return {
      level: 'Basic',
      color: SemanticColors.activityValue.basic,
      icon: '📝',
      description: 'Routine operational tasks'
    };
  }
  if (value > 0) {
    return {
      level: 'Low Value',
      color: SemanticColors.activityValue.lowValue,
      icon: '📋',
      description: 'Minimal value activities'
    };
  }
  if (value === 0) {
    return {
      level: 'Free Activities',
      color: SemanticColors.activityValue.free,
      icon: '🆓',
      description: 'No direct value'
    };
  }
  return {
    level: 'Income Killers',
    color: SemanticColors.activityValue.negative,
    icon: '❌',
    description: 'Activities that cost money or time'
  };
};

// ============================================================================
// CONSOLIDATED ACTIVITY VALUE STYLING SYSTEM
// ============================================================================

/**
 * Consolidated activity styling utilities to replace duplicated logic
 * This replaces the getActivityCardStyle function from DashboardScreen.tsx
 */
export const getActivityValueStyles = (value: number) => {
  const levelInfo = getActivityLevelInfo(value);
  const color = getActivityValueColor(value);
  
  return {
    // Card styling with left border accent
    cardStyle: {
      borderLeftWidth: 4,
      borderLeftColor: color,
      backgroundColor: SemanticColors.surface.primary
    } as ViewStyle,
    
    // Badge styling for value display  
    badgeStyle: {
      backgroundColor: color,
      color: value >= 2000000 ? Colors.neutral[900] : Colors.neutral[0], // CEO level uses dark text
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      fontSize: FontSize.xs,
      fontWeight: FontWeight.semiBold
    } as ViewStyle & TextStyle,
    
    // Background tinting for timeline cards (lighter version)
    backgroundTint: {
      backgroundColor: color + '10' // 10% opacity tint
    } as ViewStyle,
    
    // Icon and text styling
    iconStyle: {
      icon: levelInfo.icon,
      color: color
    },
    
    // Category header styling for activity selection modal
    categoryHeaderStyle: {
      backgroundColor: color,
      color: value >= 2000000 ? Colors.neutral[900] : Colors.neutral[0]
    } as ViewStyle & TextStyle,
    
    // Metadata
    level: levelInfo.level,
    description: levelInfo.description,
    tier: getActivityTierName(value)
  };
};

/**
 * Get activity tier name for categorization
 */
export const getActivityTierName = (value: number): string => {
  if (value >= 2000000) return 'ceo';
  if (value >= 200000) return 'executive';  
  if (value >= 20000) return 'highValue';
  if (value >= 2000) return 'professional';
  if (value >= 200) return 'basic';
  if (value > 0) return 'lowValue';
  if (value === 0) return 'free';
  return 'negative';
};

/**
 * Calculate dashboard metrics from time slots
 * Consolidates the calculation logic from DashboardScreen.tsx
 */
export const calculateDashboardMetrics = (timeSlots: any[]) => {
  const filledSlots = timeSlots.filter(s => s.activity).length;
  const highValueSlots = timeSlots.filter(s => s.value >= 10000).length;
  const zeroValueSlots = timeSlots.filter(s => s.activity && s.value === 0).length;
  const totalValue = timeSlots.reduce((sum, s) => sum + (s.value || 0), 0);
  const avgHourlyValue = filledSlots > 0 ? Math.round(totalValue / (filledSlots * 0.5)) : 0;
  const efficiency = timeSlots.length > 0 ? Math.round((filledSlots / timeSlots.length) * 100) : 0;
  const highValuePercentage = filledSlots > 0 ? Math.round((highValueSlots / filledSlots) * 100) : 0;
  
  return {
    filledSlots,
    totalSlots: timeSlots.length,
    highValueSlots,
    zeroValueSlots,
    totalValue,
    avgHourlyValue,
    efficiency,
    highValuePercentage
  };
};

// Accessibility helpers
export const getContrastRatio = (_foreground: string, _background: string): number => {
  // Simplified contrast ratio calculation
  // In production, use a proper color contrast library
  return 4.5; // Placeholder - should calculate actual contrast
};

export const meetsWCAGAA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 4.5;
};

export const meetsWCAGAAA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 7;
};

// ============================================================================
// CHART & VISUALIZATION SYSTEM
// ============================================================================

export const ChartTokens = {
  // Chart dimensions
  dimensions: {
    barWidth: 30,
    barMinHeight: 20,
    barMaxHeight: 200,
    chartPadding: Spacing.lg,
    labelOffset: Spacing.md
  },
  
  // Chart colors - matching pine-theme.css
  colors: {
    chart1: Colors.primary[500], // Primary blue
    chart2: '#6B9DFF', // Light blue (oklch(0.6000 0.2200 180.0000))
    chart3: '#FFCA28', // Yellow (oklch(0.7000 0.2000 60.0000))
    chart4: '#FF6B6B', // Red (oklch(0.5500 0.2500 15.0000))
    chart5: '#9C88FF', // Purple (oklch(0.3500 0.1500 270.0000))
    
    // Gradient definitions
    primaryGradient: [Colors.primary[400], Colors.premium[600]],
    successGradient: [Colors.success[400], Colors.success[600]],
    warningGradient: [Colors.warning[400], Colors.warning[600]],
  },
  
  // Animation timing
  animation: {
    barGrowDuration: 800,
    staggerDelay: 100,
    easeType: 'ease-out',
    hoverScale: 1.05
  },
  
  // Interactive states
  states: {
    hover: {
      transform: [{ scale: 1.05 }],
      shadowOpacity: 0.15
    },
    pressed: {
      transform: [{ scale: 0.98 }],
      shadowOpacity: 0.05
    }
  }
} as const;

// ============================================================================
// ENHANCED ANIMATION SYSTEM
// ============================================================================

export const EnhancedAnimation = {
  // Durations (in milliseconds)
  duration: {
    instant: 0,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
    slowest: 1200
  },
  
  // Easing curves
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounceIn: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    bounceOut: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  
  // Common animation presets
  presets: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 300,
      easing: 'ease-out'
    },
    slideUp: {
      from: { transform: [{ translateY: 20 }], opacity: 0 },
      to: { transform: [{ translateY: 0 }], opacity: 1 },
      duration: 400,
      easing: 'ease-out'
    },
    scale: {
      from: { transform: [{ scale: 0.9 }], opacity: 0 },
      to: { transform: [{ scale: 1 }], opacity: 1 },
      duration: 300,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    },
    bounce: {
      duration: 600,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  },
  
  // Loading states
  loading: {
    skeleton: {
      colors: [Colors.neutral[200], Colors.neutral[100], Colors.neutral[200]],
      duration: 1500
    },
    spinner: {
      duration: 1000,
      easing: 'linear'
    },
    pulse: {
      duration: 2000,
      easing: 'ease-in-out'
    }
  }
} as const;

// ============================================================================
// STATS-SPECIFIC DESIGN TOKENS
// ============================================================================

export const StatsTokens = {
  // Section spacing
  layout: {
    sectionSpacing: Spacing['4xl'],
    cardSpacing: Spacing.lg,
    headerHeight: 60,
    footerPadding: Spacing['3xl']
  },
  
  // Efficiency meter
  efficiency: {
    size: 120,
    strokeWidth: 8,
    backgroundColor: Colors.neutral[200],
    foregroundColor: Colors.primary[500],
    animationDuration: 1500
  },
  
  // Value tier colors (from pine-theme.css)
  tiers: {
    ceo: '#FFCA28', // oklch(0.7000 0.2000 60.0000) - Gold
    executive: Colors.primary[600], // Blue
    highValue: Colors.success[600], // Green
    professional: Colors.primary[400], // Light blue
    basic: Colors.neutral[500], // Gray
    lowValue: Colors.neutral[400], // Light gray
    free: Colors.neutral[500], // Gray
    negative: Colors.error[500] // Red
  },
  
  // Insight cards
  insights: {
    cardPadding: Spacing.lg,
    iconSize: 24,
    valueSize: FontSize['3xl'],
    labelSize: FontSize.sm,
    gridGap: Spacing.md
  },
  
  // Activity ranking
  ranking: {
    rankSize: 32,
    rankFontSize: FontSize.base,
    itemPadding: Spacing.md,
    itemSpacing: Spacing.sm
  }
} as const;