// Pine App - Modern Premium Design System v2.0
// Sophisticated design tokens for a premium financial time tracking experience

import { TextStyle, ViewStyle } from 'react-native';

// ============================================================================
// MODERN COLOR SYSTEM - Premium Financial App Palette
// ============================================================================

export const ModernColors = {
  // Primary Brand - Sophisticated emerald/forest green
  primary: {
    50: '#ECFDF5',   // Lightest mint
    100: '#D1FAE5',  // Light mint
    200: '#A7F3D0',  // Soft mint
    300: '#6EE7B7',  // Medium mint
    400: '#34D399',  // Bright emerald
    500: '#10B981',  // Primary brand (emerald-500)
    600: '#059669',  // Rich emerald
    700: '#047857',  // Deep emerald
    800: '#065F46',  // Forest green
    900: '#064E3B'   // Darkest forest
  },

  // Secondary - Sophisticated slate/blue-gray
  secondary: {
    50: '#F8FAFC',   // Pure white tint
    100: '#F1F5F9',  // Lightest slate
    200: '#E2E8F0',  // Light slate
    300: '#CBD5E1',  // Medium-light slate
    400: '#94A3B8',  // Medium slate
    500: '#64748B',  // True slate
    600: '#475569',  // Dark slate
    700: '#334155',  // Rich slate
    800: '#1E293B',  // Dark blue-gray
    900: '#0F172A'   // Darkest navy
  },

  // Accent - Warm amber/gold for premium features
  accent: {
    50: '#FFFBEB',   // Lightest cream
    100: '#FEF3C7',  // Light cream
    200: '#FDE68A',  // Soft amber
    300: '#FCD34D',  // Medium amber
    400: '#FBBF24',  // Bright amber
    500: '#F59E0B',  // Primary amber
    600: '#D97706',  // Rich amber
    700: '#B45309',  // Deep amber
    800: '#92400E',  // Bronze
    900: '#78350F'   // Dark bronze
  },

  // Success - Rich emerald matching primary but distinct
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',  // Matches primary for coherence
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B'
  },

  // Warning - Sophisticated amber
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Primary warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F'
  },

  // Error - Sophisticated red
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Primary error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D'
  },

  // Premium tier - Luxurious gold
  premium: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',  // Rich gold
    600: '#CA8A04',  // Deep gold
    700: '#A16207',  // Bronze gold
    800: '#854D0E',  // Dark bronze
    900: '#713F12'   // Darkest bronze
  }
} as const;

// Modern Semantic Color System
export const SemanticColors = {
  // Text hierarchy - sophisticated and readable
  text: {
    primary: ModernColors.secondary[900],      // Rich navy for primary text
    secondary: ModernColors.secondary[600],    // Medium slate for secondary
    tertiary: ModernColors.secondary[500],     // Light slate for tertiary
    disabled: ModernColors.secondary[400],     // Muted for disabled
    inverse: ModernColors.secondary[50],       // Light text on dark backgrounds
    accent: ModernColors.primary[600],         // Brand color for links/accents
    success: ModernColors.success[700],        // Rich emerald for success
    warning: ModernColors.warning[600],        // Rich amber for warnings
    error: ModernColors.error[600],            // Rich red for errors
    premium: ModernColors.premium[600]         // Gold for premium features
  },

  // Background system - layered and sophisticated
  background: {
    primary: ModernColors.secondary[50],       // Pure white equivalent
    secondary: ModernColors.secondary[100],    // Light background
    tertiary: ModernColors.secondary[200],     // Subtle background
    elevated: '#FFFFFF',                       // Pure white for cards
    overlay: ModernColors.secondary[900] + 'CC', // 80% opacity overlay
    disabled: ModernColors.secondary[200]      // Disabled background
  },

  // Surface colors for cards and containers
  surface: {
    primary: '#FFFFFF',                        // Pure white surfaces
    secondary: ModernColors.secondary[50],     // Subtle tint
    tertiary: ModernColors.secondary[100],     // Light surfaces
    elevated: '#FFFFFF',                       // Elevated cards
    hover: ModernColors.secondary[100],        // Hover states
    pressed: ModernColors.secondary[200],      // Pressed states
    selected: ModernColors.primary[50],        // Selected states
    disabled: ModernColors.secondary[100],     // Disabled surfaces
    premium: ModernColors.premium[50]          // Premium surfaces
  },

  // Border system - subtle and refined
  border: {
    primary: ModernColors.secondary[200],      // Default borders
    secondary: ModernColors.secondary[300],    // Stronger borders
    hover: ModernColors.secondary[400],        // Hover borders
    focus: ModernColors.primary[500],          // Focus borders
    error: ModernColors.error[400],            // Error borders
    disabled: ModernColors.secondary[200],     // Disabled borders
    divider: ModernColors.secondary[200] + '60' // 40% opacity dividers
  },

  // Activity value colors - sophisticated financial tiers
  activityValue: {
    ceoLevel: ModernColors.premium[500],       // ₹2M+ - Rich gold
    executive: ModernColors.primary[600],      // ₹200K-₹2M - Rich emerald
    highValue: ModernColors.accent[600],       // ₹20K-₹200K - Rich amber
    professional: ModernColors.secondary[600], // ₹2K-₹20K - Professional slate
    basic: ModernColors.secondary[500],        // ₹200-₹2K - Medium slate
    lowValue: ModernColors.secondary[400],     // ₹0-₹200 - Light slate
    free: ModernColors.secondary[400],         // ₹0 - Same as low value
    negative: ModernColors.error[500]          // <₹0 - Error red
  }
} as const;

// Modern gradient system
export const ModernGradients = {
  primary: [ModernColors.primary[400], ModernColors.primary[600]] as const,
  secondary: [ModernColors.secondary[100], ModernColors.secondary[300]] as const,
  premium: [ModernColors.premium[400], ModernColors.premium[600]] as const,
  success: [ModernColors.success[400], ModernColors.success[600]] as const,
  subtle: ['#FFFFFF', ModernColors.secondary[50]] as const,
  overlay: ['transparent', ModernColors.secondary[900] + '40'] as const
} as const;

// ============================================================================
// SOPHISTICATED TYPOGRAPHY SYSTEM
// ============================================================================

// Premium font families - carefully selected for financial apps
export const ModernFontFamily = {
  // Primary: SF Pro/Inter - Clean, professional, highly readable
  primary: 'SF Pro Display, Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  
  // Secondary: SF Pro Text - Optimized for body text
  body: 'SF Pro Text, Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  
  // Monospace: SF Mono/JetBrains - Financial numbers and data
  mono: 'SF Mono, JetBrains Mono, Menlo, Monaco, monospace',
  
  // Accent: Optionally Poppins for headings (modern, friendly)
  accent: 'Poppins, SF Pro Display, Inter, sans-serif'
} as const;

// Refined font weights
export const ModernFontWeight = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const
} as const;

// Sophisticated type scale - based on 1.25 ratio (Major Third)
export const ModernFontSize = {
  xs: 12,    // Small labels, captions
  sm: 14,    // Body small, secondary text
  base: 16,  // Base body text
  lg: 18,    // Large body, small headings
  xl: 20,    // Subheadings
  '2xl': 24, // H4
  '3xl': 28, // H3
  '4xl': 32, // H2
  '5xl': 36, // H1
  '6xl': 42, // Display
  '7xl': 48, // Large display
  '8xl': 56  // Hero display
} as const;

// Precise line heights for readability
export const ModernLineHeight = {
  tight: 1.15,    // Large headings
  snug: 1.25,     // Headings
  normal: 1.4,    // Body text (optimal for reading)
  relaxed: 1.5,   // Comfortable reading
  loose: 1.75     // Very relaxed text
} as const;

// Modern typography styles - semantic and purposeful
export const ModernTypography = {
  // Display text - for hero sections and major numbers
  displayLarge: {
    fontSize: ModernFontSize['8xl'],
    fontWeight: ModernFontWeight.black,
    lineHeight: ModernFontSize['8xl'] * ModernLineHeight.tight,
    fontFamily: ModernFontFamily.accent,
    letterSpacing: -0.02
  } as TextStyle,

  displayMedium: {
    fontSize: ModernFontSize['7xl'],
    fontWeight: ModernFontWeight.extrabold,
    lineHeight: ModernFontSize['7xl'] * ModernLineHeight.tight,
    fontFamily: ModernFontFamily.accent,
    letterSpacing: -0.02
  } as TextStyle,

  displaySmall: {
    fontSize: ModernFontSize['6xl'],
    fontWeight: ModernFontWeight.bold,
    lineHeight: ModernFontSize['6xl'] * ModernLineHeight.snug,
    fontFamily: ModernFontFamily.accent,
    letterSpacing: -0.01
  } as TextStyle,

  // Headings - clear hierarchy
  heading1: {
    fontSize: ModernFontSize['5xl'],
    fontWeight: ModernFontWeight.bold,
    lineHeight: ModernFontSize['5xl'] * ModernLineHeight.snug,
    fontFamily: ModernFontFamily.primary,
    letterSpacing: -0.01
  } as TextStyle,

  heading2: {
    fontSize: ModernFontSize['4xl'],
    fontWeight: ModernFontWeight.bold,
    lineHeight: ModernFontSize['4xl'] * ModernLineHeight.snug,
    fontFamily: ModernFontFamily.primary,
    letterSpacing: -0.005
  } as TextStyle,

  heading3: {
    fontSize: ModernFontSize['3xl'],
    fontWeight: ModernFontWeight.semibold,
    lineHeight: ModernFontSize['3xl'] * ModernLineHeight.snug,
    fontFamily: ModernFontFamily.primary
  } as TextStyle,

  heading4: {
    fontSize: ModernFontSize['2xl'],
    fontWeight: ModernFontWeight.semibold,
    lineHeight: ModernFontSize['2xl'] * ModernLineHeight.normal,
    fontFamily: ModernFontFamily.primary
  } as TextStyle,

  heading5: {
    fontSize: ModernFontSize.xl,
    fontWeight: ModernFontWeight.medium,
    lineHeight: ModernFontSize.xl * ModernLineHeight.normal,
    fontFamily: ModernFontFamily.primary
  } as TextStyle,

  heading6: {
    fontSize: ModernFontSize.lg,
    fontWeight: ModernFontWeight.medium,
    lineHeight: ModernFontSize.lg * ModernLineHeight.normal,
    fontFamily: ModernFontFamily.primary
  } as TextStyle,

  // Body text - optimized for readability
  bodyLarge: {
    fontSize: ModernFontSize.lg,
    fontWeight: ModernFontWeight.regular,
    lineHeight: ModernFontSize.lg * ModernLineHeight.relaxed,
    fontFamily: ModernFontFamily.body
  } as TextStyle,

  bodyMedium: {
    fontSize: ModernFontSize.base,
    fontWeight: ModernFontWeight.regular,
    lineHeight: ModernFontSize.base * ModernLineHeight.normal,
    fontFamily: ModernFontFamily.body
  } as TextStyle,

  bodySmall: {
    fontSize: ModernFontSize.sm,
    fontWeight: ModernFontWeight.regular,
    lineHeight: ModernFontSize.sm * ModernLineHeight.normal,
    fontFamily: ModernFontFamily.body
  } as TextStyle,

  // Specialized text types
  caption: {
    fontSize: ModernFontSize.xs,
    fontWeight: ModernFontWeight.medium,
    lineHeight: ModernFontSize.xs * ModernLineHeight.normal,
    fontFamily: ModernFontFamily.body,
    letterSpacing: 0.01
  } as TextStyle,

  overline: {
    fontSize: ModernFontSize.xs,
    fontWeight: ModernFontWeight.semibold,
    lineHeight: ModernFontSize.xs * ModernLineHeight.normal,
    fontFamily: ModernFontFamily.body,
    letterSpacing: 0.08,
    textTransform: 'uppercase'
  } as TextStyle,

  label: {
    fontSize: ModernFontSize.sm,
    fontWeight: ModernFontWeight.medium,
    lineHeight: ModernFontSize.sm * ModernLineHeight.normal,
    fontFamily: ModernFontFamily.body
  } as TextStyle,

  button: {
    fontSize: ModernFontSize.base,
    fontWeight: ModernFontWeight.semibold,
    lineHeight: ModernFontSize.base * ModernLineHeight.normal,
    fontFamily: ModernFontFamily.primary
  } as TextStyle,

  // Financial/numerical text - monospace for alignment
  numericalSmall: {
    fontSize: ModernFontSize.sm,
    fontWeight: ModernFontWeight.semibold,
    lineHeight: ModernFontSize.sm * ModernLineHeight.normal,
    fontFamily: ModernFontFamily.mono
  } as TextStyle,

  numericalMedium: {
    fontSize: ModernFontSize.lg,
    fontWeight: ModernFontWeight.bold,
    lineHeight: ModernFontSize.lg * ModernLineHeight.normal,
    fontFamily: ModernFontFamily.mono
  } as TextStyle,

  numericalLarge: {
    fontSize: ModernFontSize['3xl'],
    fontWeight: ModernFontWeight.bold,
    lineHeight: ModernFontSize['3xl'] * ModernLineHeight.snug,
    fontFamily: ModernFontFamily.mono
  } as TextStyle,

  numericalDisplay: {
    fontSize: ModernFontSize['5xl'],
    fontWeight: ModernFontWeight.extrabold,
    lineHeight: ModernFontSize['5xl'] * ModernLineHeight.tight,
    fontFamily: ModernFontFamily.mono,
    letterSpacing: -0.01
  } as TextStyle
} as const;

// ============================================================================
// SOPHISTICATED SPACING SYSTEM
// ============================================================================

// 8px base unit for perfect alignment
export const ModernSpacing = {
  px: 1,     // 1px for borders
  '0.5': 2,  // 2px for tiny elements
  '1': 4,    // 4px
  '1.5': 6,  // 6px
  '2': 8,    // 8px - base unit
  '2.5': 10, // 10px
  '3': 12,   // 12px
  '3.5': 14, // 14px
  '4': 16,   // 16px - common padding
  '5': 20,   // 20px
  '6': 24,   // 24px - section spacing
  '7': 28,   // 28px
  '8': 32,   // 32px - large spacing
  '9': 36,   // 36px
  '10': 40,  // 40px
  '11': 44,  // 44px
  '12': 48,  // 48px - major sections
  '14': 56,  // 56px
  '16': 64,  // 64px - large gaps
  '20': 80,  // 80px
  '24': 96,  // 96px - extra large
  '32': 128, // 128px - hero spacing
  '40': 160, // 160px
  '48': 192, // 192px
  '56': 224, // 224px
  '64': 256  // 256px - maximum
} as const;

// Layout constants for consistency
export const ModernLayout = {
  containerMaxWidth: 768,
  containerPadding: ModernSpacing['4'],
  sectionSpacing: ModernSpacing['12'],
  cardSpacing: ModernSpacing['6'],
  listItemSpacing: ModernSpacing['3']
} as const;

// ============================================================================
// MODERN BORDER & SHADOW SYSTEM
// ============================================================================

// Refined border radius - subtle but modern
export const ModernBorderRadius = {
  none: 0,
  xs: 2,      // Subtle rounding
  sm: 4,      // Small elements
  md: 6,      // Default components
  lg: 8,      // Cards and containers
  xl: 12,     // Large components
  '2xl': 16,  // Extra large
  '3xl': 20,  // Hero elements
  full: 9999  // Pills and circles
} as const;

// Sophisticated shadow system - subtle and elegant
export const ModernShadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },

  // Subtle shadows for layering
  xs: {
    shadowColor: ModernColors.secondary[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  },

  sm: {
    shadowColor: ModernColors.secondary[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },

  md: {
    shadowColor: ModernColors.secondary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4
  },

  lg: {
    shadowColor: ModernColors.secondary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  },

  xl: {
    shadowColor: ModernColors.secondary[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12
  },

  // Special premium shadow with subtle color tint
  premium: {
    shadowColor: ModernColors.premium[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
  }
} as const;

// ============================================================================
// MODERN COMPONENT TOKENS
// ============================================================================

export const ModernComponentStyles = {
  // Button system - sophisticated and purposeful
  button: {
    primary: {
      backgroundColor: ModernColors.primary[500],
      borderColor: ModernColors.primary[500],
      borderWidth: 1,
      borderRadius: ModernBorderRadius.lg,
      paddingHorizontal: ModernSpacing['6'],
      paddingVertical: ModernSpacing['3'],
      minHeight: 44,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      ...ModernShadows.sm
    } as ViewStyle,

    secondary: {
      backgroundColor: 'transparent',
      borderColor: ModernColors.secondary[300],
      borderWidth: 1,
      borderRadius: ModernBorderRadius.lg,
      paddingHorizontal: ModernSpacing['6'],
      paddingVertical: ModernSpacing['3'],
      minHeight: 44,
      justifyContent: 'center' as const,
      alignItems: 'center' as const
    } as ViewStyle,

    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: ModernBorderRadius.lg,
      paddingHorizontal: ModernSpacing['4'],
      paddingVertical: ModernSpacing['2'],
      minHeight: 40,
      justifyContent: 'center' as const,
      alignItems: 'center' as const
    } as ViewStyle,

    premium: {
      backgroundColor: ModernColors.premium[500],
      borderColor: ModernColors.premium[500],
      borderWidth: 1,
      borderRadius: ModernBorderRadius.lg,
      paddingHorizontal: ModernSpacing['6'],
      paddingVertical: ModernSpacing['3'],
      minHeight: 44,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      ...ModernShadows.premium
    } as ViewStyle
  },

  // Card system - elegant and functional
  card: {
    default: {
      backgroundColor: SemanticColors.surface.primary,
      borderRadius: ModernBorderRadius.xl,
      padding: ModernSpacing['6'],
      ...ModernShadows.sm
    } as ViewStyle,

    elevated: {
      backgroundColor: SemanticColors.surface.primary,
      borderRadius: ModernBorderRadius.xl,
      padding: ModernSpacing['6'],
      ...ModernShadows.lg
    } as ViewStyle,

    outlined: {
      backgroundColor: SemanticColors.surface.primary,
      borderRadius: ModernBorderRadius.xl,
      padding: ModernSpacing['6'],
      borderWidth: 1,
      borderColor: SemanticColors.border.primary
    } as ViewStyle,

    premium: {
      backgroundColor: ModernColors.premium[50],
      borderRadius: ModernBorderRadius.xl,
      padding: ModernSpacing['6'],
      borderWidth: 1,
      borderColor: ModernColors.premium[200],
      ...ModernShadows.premium
    } as ViewStyle
  },

  // Input system - clean and accessible
  input: {
    default: {
      backgroundColor: SemanticColors.surface.primary,
      borderWidth: 1,
      borderColor: SemanticColors.border.primary,
      borderRadius: ModernBorderRadius.lg,
      paddingHorizontal: ModernSpacing['4'],
      paddingVertical: ModernSpacing['3'],
      minHeight: 44,
      fontSize: ModernFontSize.base,
      fontFamily: ModernFontFamily.body
    } as ViewStyle & TextStyle,

    focused: {
      borderColor: SemanticColors.border.focus,
      borderWidth: 2,
      ...ModernShadows.sm
    } as ViewStyle,

    error: {
      borderColor: SemanticColors.border.error,
      borderWidth: 2
    } as ViewStyle
  }
} as const;

// ============================================================================
// UTILITY FUNCTIONS - Enhanced for modern design
// ============================================================================

export const getModernActivityValueColor = (value: number): string => {
  if (value >= 2000000) return SemanticColors.activityValue.ceoLevel;
  if (value >= 200000) return SemanticColors.activityValue.executive;
  if (value >= 20000) return SemanticColors.activityValue.highValue;
  if (value >= 2000) return SemanticColors.activityValue.professional;
  if (value >= 200) return SemanticColors.activityValue.basic;
  if (value > 0) return SemanticColors.activityValue.lowValue;
  if (value === 0) return SemanticColors.activityValue.free;
  return SemanticColors.activityValue.negative;
};

export const getModernActivityLevelInfo = (value: number) => {
  if (value >= 2000000) {
    return {
      level: 'CEO Level',
      color: SemanticColors.activityValue.ceoLevel,
      icon: '👑',
      description: 'Strategic leadership & vision',
      tier: 'premium'
    };
  }
  if (value >= 200000) {
    return {
      level: 'Executive',
      color: SemanticColors.activityValue.executive,
      icon: '🎯',
      description: 'High-impact business decisions',
      tier: 'executive'
    };
  }
  if (value >= 20000) {
    return {
      level: 'High Value',
      color: SemanticColors.activityValue.highValue,
      icon: '✨',
      description: 'Strategic & revenue-generating',
      tier: 'high'
    };
  }
  if (value >= 2000) {
    return {
      level: 'Professional',
      color: SemanticColors.activityValue.professional,
      icon: '💼',
      description: 'Skilled professional work',
      tier: 'professional'
    };
  }
  if (value >= 200) {
    return {
      level: 'Basic',
      color: SemanticColors.activityValue.basic,
      icon: '📝',
      description: 'Standard operational tasks',
      tier: 'basic'
    };
  }
  if (value > 0) {
    return {
      level: 'Low Value',
      color: SemanticColors.activityValue.lowValue,
      icon: '📋',
      description: 'Routine activities',
      tier: 'low'
    };
  }
  if (value === 0) {
    return {
      level: 'Free Time',
      color: SemanticColors.activityValue.free,
      icon: '🆓',
      description: 'Personal & leisure time',
      tier: 'free'
    };
  }
  return {
    level: 'Income Killers',
    color: SemanticColors.activityValue.negative,
    icon: '⚠️',
    description: 'Time & money drains',
    tier: 'negative'
  };
};

// Export for compatibility
export const {
  primary: Colors,
  secondary: NeutralColors
} = ModernColors;

export const {
  text: TextColors,
  background: BackgroundColors,
  surface: SurfaceColors,
  border: BorderColors
} = SemanticColors;