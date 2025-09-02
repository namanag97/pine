// Pine App - Modern UI Component Library v2.0
// Consolidated, sophisticated components using the modern design system

import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacityProps
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  ModernColors,
  SemanticColors,
  ModernTypography,
  ModernSpacing,
  ModernBorderRadius,
  ModernShadows,
  ModernComponentStyles,
  getModernActivityValueColor,
  getModernActivityLevelInfo
} from '../styles/modernDesignSystem';
import { TimeSlot } from '../types';

// ============================================================================
// TYPOGRAPHY COMPONENTS - Modern and Semantic
// ============================================================================

interface TextProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: keyof typeof SemanticColors.text;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
}

export const Display: React.FC<TextProps & { size?: 'small' | 'medium' | 'large' }> = ({
  children, style, color = 'primary', align = 'left', size = 'medium', numberOfLines, ...props
}) => {
  const sizeStyles = {
    small: ModernTypography.displaySmall,
    medium: ModernTypography.displayMedium,
    large: ModernTypography.displayLarge
  };

  return (
    <Text
      style={[
        sizeStyles[size],
        { color: SemanticColors.text[color], textAlign: align },
        style
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Heading: React.FC<TextProps & { level: 1 | 2 | 3 | 4 | 5 | 6 }> = ({
  children, style, color = 'primary', align = 'left', level, numberOfLines, ...props
}) => {
  const levelStyles = {
    1: ModernTypography.heading1,
    2: ModernTypography.heading2,
    3: ModernTypography.heading3,
    4: ModernTypography.heading4,
    5: ModernTypography.heading5,
    6: ModernTypography.heading6
  };

  return (
    <Text
      style={[
        levelStyles[level],
        { color: SemanticColors.text[color], textAlign: align },
        style
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Body: React.FC<TextProps & { size?: 'small' | 'medium' | 'large' }> = ({
  children, style, color = 'primary', align = 'left', size = 'medium', numberOfLines, ...props
}) => {
  const sizeStyles = {
    small: ModernTypography.bodySmall,
    medium: ModernTypography.bodyMedium,
    large: ModernTypography.bodyLarge
  };

  return (
    <Text
      style={[
        sizeStyles[size],
        { color: SemanticColors.text[color], textAlign: align },
        style
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

export const Caption: React.FC<TextProps> = ({
  children, style, color = 'tertiary', align = 'left', numberOfLines, ...props
}) => (
  <Text
    style={[
      ModernTypography.caption,
      { color: SemanticColors.text[color], textAlign: align },
      style
    ]}
    numberOfLines={numberOfLines}
    {...props}
  >
    {children}
  </Text>
);

export const Label: React.FC<TextProps> = ({
  children, style, color = 'secondary', align = 'left', numberOfLines, ...props
}) => (
  <Text
    style={[
      ModernTypography.label,
      { color: SemanticColors.text[color], textAlign: align },
      style
    ]}
    numberOfLines={numberOfLines}
    {...props}
  >
    {children}
  </Text>
);

export const Overline: React.FC<TextProps> = ({
  children, style, color = 'tertiary', align = 'left', numberOfLines, ...props
}) => (
  <Text
    style={[
      ModernTypography.overline,
      { color: SemanticColors.text[color], textAlign: align },
      style
    ]}
    numberOfLines={numberOfLines}
    {...props}
  >
    {children}
  </Text>
);

// Numerical components for financial values
interface CurrencyTextProps {
  value: number; 
  size?: 'small' | 'medium' | 'large' | 'display';
  showSymbol?: boolean;
  style?: TextStyle;
  color?: keyof typeof SemanticColors.text;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
}

export const CurrencyText: React.FC<CurrencyTextProps> = ({ 
  value, 
  size = 'medium', 
  showSymbol = true, 
  style, 
  color = 'primary', 
  align = 'left',
  numberOfLines
}) => {
  const sizeStyles = {
    small: ModernTypography.numericalSmall,
    medium: ModernTypography.numericalMedium,
    large: ModernTypography.numericalLarge,
    display: ModernTypography.numericalDisplay
  };

  const formatCurrency = (num: number): string => {
    const symbol = showSymbol ? '₹' : '';
    if (Math.abs(num) >= 10000000) { // 1 crore
      return `${symbol}${(num / 10000000).toFixed(1)}Cr`;
    }
    if (Math.abs(num) >= 100000) { // 1 lakh
      return `${symbol}${(num / 100000).toFixed(1)}L`;
    }
    if (Math.abs(num) >= 1000) { // 1 thousand
      return `${symbol}${(num / 1000).toFixed(1)}K`;
    }
    return `${symbol}${num.toLocaleString('en-IN')}`;
  };

  return (
    <Text
      style={[
        sizeStyles[size],
        { color: SemanticColors.text[color], textAlign: align },
        style
      ]}
    >
      {formatCurrency(value)}
    </Text>
  );
};

// ============================================================================
// BUTTON COMPONENTS - Modern and Accessible
// ============================================================================

interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'premium';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  style,
  disabled,
  ...props
}) => {
  const baseStyles = ModernComponentStyles.button[variant];
  
  const sizeStyles = {
    small: { 
      paddingHorizontal: ModernSpacing['4'], 
      paddingVertical: ModernSpacing['2'], 
      minHeight: 36 
    },
    medium: { 
      paddingHorizontal: ModernSpacing['6'], 
      paddingVertical: ModernSpacing['3'], 
      minHeight: 44 
    },
    large: { 
      paddingHorizontal: ModernSpacing['8'], 
      paddingVertical: ModernSpacing['4'], 
      minHeight: 52 
    }
  };

  const textColorMap = {
    primary: SemanticColors.text.inverse,
    secondary: SemanticColors.text.primary,
    ghost: SemanticColors.text.primary,
    premium: SemanticColors.text.primary
  };

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <TouchableOpacity
      style={[
        baseStyles,
        sizeStyles[size],
        fullWidth && { width: '100%' },
        disabled && { opacity: 0.6 },
        style
      ]}
      disabled={disabled || loading}
      {...props}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: ModernSpacing['2'] }}>
        {icon && iconPosition === 'left' && (
          <Ionicons name={icon} size={iconSize} color={textColorMap[variant]} />
        )}
        <Text style={[ModernTypography.button, { color: textColorMap[variant] }]}>
          {loading ? 'Loading...' : children}
        </Text>
        {icon && iconPosition === 'right' && (
          <Ionicons name={icon} size={iconSize} color={textColorMap[variant]} />
        )}
      </View>
    </TouchableOpacity>
  );
};

// ============================================================================
// CARD COMPONENTS - Elegant and Functional
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'premium';
  padding?: keyof typeof ModernSpacing;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding,
  style,
  onPress,
  ...props
}) => {
  const baseStyles = ModernComponentStyles.card[variant];
  const paddingStyle = padding ? { padding: ModernSpacing[padding] } : {};

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[baseStyles, paddingStyle, style]}
      onPress={onPress}
      {...props}
    >
      {children}
    </Component>
  );
};

// ============================================================================
// INPUT COMPONENTS - Clean and Accessible
// ============================================================================

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'focused' | 'error';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconPosition = 'left',
  variant = 'default',
  style,
  ...props
}) => {
  const [focused, setFocused] = React.useState(false);
  const inputVariant = error ? 'error' : focused ? 'focused' : variant;
  const inputStyles = ModernComponentStyles.input[inputVariant];

  return (
    <View style={{ gap: ModernSpacing['2'] }}>
      {label && <Label>{label}</Label>}
      <View style={{ position: 'relative' }}>
        <TextInput
          style={[
            ModernComponentStyles.input.default,
            inputStyles,
            icon && iconPosition === 'left' && { paddingLeft: ModernSpacing['10'] },
            icon && iconPosition === 'right' && { paddingRight: ModernSpacing['10'] },
            style
          ]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {icon && (
          <View
            style={{
              position: 'absolute',
              top: '50%',
              [iconPosition === 'left' ? 'left' : 'right']: ModernSpacing['3'],
              transform: [{ translateY: -10 }]
            }}
          >
            <Ionicons
              name={icon}
              size={20}
              color={error ? SemanticColors.text.error : SemanticColors.text.tertiary}
            />
          </View>
        )}
      </View>
      {error && (
        <Caption color="error" style={{ marginTop: ModernSpacing['1'] }}>
          {error}
        </Caption>
      )}
    </View>
  );
};

// ============================================================================
// LAYOUT COMPONENTS - Flexible and Consistent
// ============================================================================

interface ContainerProps {
  children: React.ReactNode;
  padding?: keyof typeof ModernSpacing;
  maxWidth?: number;
  centered?: boolean;
  style?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  padding = '4',
  maxWidth = 768,
  centered = true,
  style,
  ...props
}) => (
  <View
    style={[
      {
        padding: ModernSpacing[padding],
        maxWidth,
        width: '100%',
        ...(centered && { alignSelf: 'center' })
      },
      style
    ]}
    {...props}
  >
    {children}
  </View>
);

interface StackProps {
  children: React.ReactNode;
  spacing?: keyof typeof ModernSpacing;
  direction?: 'row' | 'column';
  align?: 'stretch' | 'center' | 'flex-start' | 'flex-end';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  style?: ViewStyle;
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = '4',
  direction = 'column',
  align = 'stretch',
  justify = 'flex-start',
  style,
  ...props
}) => (
  <View
    style={[
      {
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        gap: ModernSpacing[spacing]
      },
      style
    ]}
    {...props}
  >
    {children}
  </View>
);

// ============================================================================
// ACTIVITY-SPECIFIC COMPONENTS - Pine App Specialized
// ============================================================================

interface ActivityValueBadgeProps {
  value: number;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: ViewStyle;
}

export const ActivityValueBadge: React.FC<ActivityValueBadgeProps> = ({
  value,
  size = 'medium',
  showIcon = true,
  style
}) => {
  const levelInfo = getModernActivityLevelInfo(value);
  
  const sizeStyles = {
    small: {
      paddingHorizontal: ModernSpacing['2'],
      paddingVertical: ModernSpacing['1'],
      borderRadius: ModernBorderRadius.sm
    },
    medium: {
      paddingHorizontal: ModernSpacing['3'],
      paddingVertical: ModernSpacing['1.5'],
      borderRadius: ModernBorderRadius.md
    },
    large: {
      paddingHorizontal: ModernSpacing['4'],
      paddingVertical: ModernSpacing['2'],
      borderRadius: ModernBorderRadius.lg
    }
  };

  const textStyles = {
    small: ModernTypography.caption,
    medium: ModernTypography.label,
    large: ModernTypography.bodySmall
  };

  const isGoldTier = levelInfo.tier === 'premium';
  const textColor = isGoldTier ? SemanticColors.text.primary : SemanticColors.text.inverse;

  return (
    <View
      style={[
        {
          backgroundColor: levelInfo.color,
          flexDirection: 'row',
          alignItems: 'center',
          gap: ModernSpacing['1']
        },
        sizeStyles[size],
        style
      ]}
    >
      {showIcon && <Text style={{ fontSize: textStyles[size].fontSize }}>{levelInfo.icon}</Text>}
      <Text style={[textStyles[size], { color: textColor, fontWeight: '600' }]}>
        {levelInfo.level}
      </Text>
    </View>
  );
};

interface TimeSlotCardProps {
  timeSlot: TimeSlot;
  onPress: (timeSlot: TimeSlot) => void;
  isCurrentSlot?: boolean;
  style?: ViewStyle;
}

export const TimeSlotCard: React.FC<TimeSlotCardProps> = ({
  timeSlot,
  onPress,
  isCurrentSlot = false,
  style
}) => {
  const hasActivity = !!timeSlot.activity;
  const activityColor = hasActivity ? getModernActivityValueColor(timeSlot.value) : undefined;

  return (
    <TouchableOpacity onPress={() => onPress(timeSlot)}>
      <Card
        variant={hasActivity ? 'elevated' : 'outlined'}
        style={{
          minHeight: 72,
          borderLeftWidth: hasActivity ? 4 : 0,
          borderLeftColor: activityColor,
          backgroundColor: isCurrentSlot ? SemanticColors.surface.selected : undefined,
          ...style
        }}
      >
        <Stack direction="row" align="center" justify="space-between">
          <View style={{ flex: 1 }}>
            {hasActivity && timeSlot.activity ? (
              <>
                <Body size="medium" color="primary" numberOfLines={2}>
                  {timeSlot.activity.name}
                </Body>
                <Stack direction="row" align="center" spacing="2" style={{ marginTop: ModernSpacing['1'] }}>
                  <CurrencyText value={timeSlot.value} size="small" />
                  <ActivityValueBadge value={timeSlot.value} size="small" />
                </Stack>
              </>
            ) : (
              <Body size="medium" color="tertiary" align="center">
                Tap to add activity
              </Body>
            )}
          </View>
          <View style={{ alignItems: 'center', minWidth: 60 }}>
            <Caption color="secondary">
              {timeSlot.startTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
              })}
            </Caption>
            {isCurrentSlot && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: SemanticColors.text.accent,
                  marginTop: ModernSpacing['1']
                }}
              />
            )}
          </View>
        </Stack>
      </Card>
    </TouchableOpacity>
  );
};

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'default' | 'premium';
  style?: ViewStyle;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  style
}) => {
  const trendColors = {
    up: SemanticColors.text.success,
    down: SemanticColors.text.error,
    neutral: SemanticColors.text.tertiary
  };

  const trendIcons = {
    up: 'trending-up' as const,
    down: 'trending-down' as const,
    neutral: 'remove' as const
  };

  return (
    <Card variant={variant === 'premium' ? 'premium' : 'elevated'} style={style}>
      <Stack spacing="2">
        <Stack direction="row" align="center" justify="space-between">
          <Label color="secondary">{title}</Label>
          {icon && <Ionicons name={icon} size={20} color={SemanticColors.text.tertiary} />}
        </Stack>
        
        <Display size="small" color="primary">
          {typeof value === 'number' ? (
            <CurrencyText value={value} size="display" />
          ) : (
            value
          )}
        </Display>
        
        {(subtitle || trend) && (
          <Stack direction="row" align="center" spacing="2">
            {trend && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: ModernSpacing['1'] }}>
                <Ionicons 
                  name={trendIcons[trend]} 
                  size={16} 
                  color={trendColors[trend]} 
                />
              </View>
            )}
            {subtitle && <Caption color="tertiary">{subtitle}</Caption>}
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

// ============================================================================
// SPECIALIZED COMPONENTS - Pine App Features
// ============================================================================

interface GradientHeaderProps {
  children: React.ReactNode;
  gradient?: [string, string];
  style?: ViewStyle;
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({
  children,
  gradient = [ModernColors.primary[500], ModernColors.primary[600]],
  style
}) => (
  <LinearGradient colors={gradient} style={[{ padding: ModernSpacing['6'] }, style]}>
    {children}
  </LinearGradient>
);

interface ActivitySearchBarProps extends TextInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const ActivitySearchBar: React.FC<ActivitySearchBarProps> = ({
  onSearch,
  placeholder = "Search activities...",
  ...props
}) => {
  const [query, setQuery] = React.useState('');

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <Input
      value={query}
      onChangeText={handleSearch}
      placeholder={placeholder}
      icon="search"
      iconPosition="left"
      style={{ backgroundColor: SemanticColors.surface.secondary }}
      {...props}
    />
  );
};

// Export all components
export {
  ModernColors,
  SemanticColors,
  ModernSpacing,
  ModernBorderRadius,
  ModernShadows
};