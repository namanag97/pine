// Pine App - Consolidated Component & Design System Exports
// Single source of truth for all UI components and design tokens

// ============================================================================
// MODERN DESIGN SYSTEM
// ============================================================================

// Core design tokens
export {
  ModernColors,
  SemanticColors,
  ModernSpacing,
  ModernBorderRadius,
  ModernShadows,
  ModernTypography,
  ModernFontFamily,
  ModernFontWeight,
  ModernFontSize,
  ModernLineHeight,
  ModernLayout,
  ModernComponentStyles,
  ModernGradients,
  
  // Utility functions
  getModernActivityValueColor,
  getModernActivityLevelInfo,
  
  // Legacy compatibility exports
  Colors,
  NeutralColors,
  TextColors,
  BackgroundColors,
  SurfaceColors,
  BorderColors
} from '../styles/modernDesignSystem';

// ============================================================================
// MODERN UI COMPONENTS
// ============================================================================

// Typography Components
export {
  Display,
  Heading,
  Body,
  Caption,
  Label,
  Overline,
  CurrencyText
} from './ModernUI';

// Interactive Components
export {
  Button,
  Input
} from './ModernUI';

// Layout Components
export {
  Card,
  Container,
  Stack
} from './ModernUI';

// Activity-Specific Components
export {
  ActivityValueBadge,
  TimeSlotCard,
  StatsCard,
  ActivitySearchBar
} from './ModernUI';

// Specialized Components
export {
  GradientHeader
} from './ModernUI';

// ============================================================================
// LEGACY COMPONENT COMPATIBILITY
// ============================================================================

// For backwards compatibility during transition
// TODO: Remove these after all screens are updated

// Re-export essential legacy components that may still be needed
export { AppText } from './ui/Typography';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ModernTheme {
  colors: typeof ModernColors;
  semantic: typeof SemanticColors;
  spacing: typeof ModernSpacing;
  typography: typeof ModernTypography;
  shadows: typeof ModernShadows;
  borderRadius: typeof ModernBorderRadius;
  layout: typeof ModernLayout;
}

export interface ComponentVariant {
  primary: 'primary';
  secondary: 'secondary'; 
  ghost: 'ghost';
  premium: 'premium';
}

export interface SizeVariant {
  small: 'small';
  medium: 'medium';
  large: 'large';
}

// ============================================================================
// DESIGN SYSTEM UTILITIES
// ============================================================================

/**
 * Get consistent spacing value
 */
export const getSpacing = (key: keyof typeof ModernSpacing): number => {
  return ModernSpacing[key];
};

/**
 * Get semantic color value
 */
export const getSemanticColor = (
  category: keyof typeof SemanticColors,
  variant: string
): string => {
  return (SemanticColors[category] as any)[variant];
};

/**
 * Create consistent shadow styles
 */
export const createShadow = (size: keyof typeof ModernShadows) => {
  return ModernShadows[size];
};

/**
 * Create rounded border styles
 */
export const createBorderRadius = (size: keyof typeof ModernBorderRadius) => {
  return { borderRadius: ModernBorderRadius[size] };
};

// ============================================================================
// DESIGN TOKENS SUMMARY
// ============================================================================

export const DESIGN_TOKENS = {
  // Color palette count
  TOTAL_COLORS: Object.keys(ModernColors).length,
  
  // Typography scale
  FONT_SIZES: Object.keys(ModernFontSize).length,
  FONT_WEIGHTS: Object.keys(ModernFontWeight).length,
  TYPE_STYLES: Object.keys(ModernTypography).length,
  
  // Spacing scale  
  SPACING_VALUES: Object.keys(ModernSpacing).length,
  
  // Component variants
  BUTTON_VARIANTS: 4, // primary, secondary, ghost, premium
  CARD_VARIANTS: 4,   // default, elevated, outlined, premium
  INPUT_VARIANTS: 3,  // default, focused, error
  
  // Activity value tiers
  ACTIVITY_TIERS: 8,  // CEO, Executive, High, Professional, Basic, Low, Free, Negative
  
  // Design system version
  VERSION: '2.0.0'
} as const;