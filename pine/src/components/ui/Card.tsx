import React, { useMemo, memo } from 'react';
import { View, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  ComponentStyles, 
  Spacing, 
  SemanticColors,
  BorderRadius,
  Shadows,
  Colors
} from '../../styles/designSystem';
import { AppText } from './Typography';
import { Stack } from './Layout';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: string;
}

export const Card: React.FC<CardProps> = memo(({
  children,
  variant = 'default',
  padding = 'medium',
  onPress,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
}) => {
  const cardStyle = useMemo((): ViewStyle => {
    const baseStyle = ComponentStyles.card[variant];
    
    let paddingStyle: ViewStyle = {};
    switch (padding) {
      case 'none':
        paddingStyle = { padding: 0 };
        break;
      case 'small':
        paddingStyle = { padding: Spacing.sm };
        break;
      case 'large':
        paddingStyle = { padding: Spacing.xl };
        break;
      default: // medium
        paddingStyle = { padding: Spacing.lg };
        break;
    }

    const disabledStyle: ViewStyle = disabled ? {
      backgroundColor: SemanticColors.surface.disabled,
      opacity: 0.6,
    } : {};

    return {
      ...baseStyle,
      ...paddingStyle,
      ...disabledStyle,
      ...style,
    };
  }, [variant, padding, disabled, style]);

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.95}
        disabled={disabled}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole as any}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View 
      style={cardStyle} 
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole as any}
    >
      {children}
    </View>
  );
});

// Specialized Card variants for common use cases
export interface ValueCardProps extends Omit<CardProps, 'variant'> {
  value: number;
  borderColor?: string;
}

export const ValueCard: React.FC<ValueCardProps> = memo(({
  children,
  value,
  borderColor,
  style,
  ...props
}) => {
  const valueCardStyle = useMemo((): ViewStyle => ({
    borderLeftWidth: 4,
    borderLeftColor: borderColor || SemanticColors.border.primary,
    ...style,
  }), [borderColor, style]);

  return (
    <Card variant="default" style={valueCardStyle} {...props}>
      {children}
    </Card>
  );
});

export interface StatCardProps extends Omit<CardProps, 'children'> {
  title: string;
  value?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  stats?: { label: string; value: string }[];
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = memo(({
  title,
  value,
  subtitle,
  icon,
  color = SemanticColors.text.primary,
  stats,
  change,
  changeType = 'neutral',
  style,
  ...props
}) => {
  const changeColor = useMemo(() => {
    switch (changeType) {
      case 'positive': return Colors.success[600];
      case 'negative': return Colors.error[600];
      default: return SemanticColors.text.secondary;
    }
  }, [changeType]);

  return (
    <Card variant="elevated" style={style} {...props}>
      <Stack spacing="sm">
        {/* Header */}
        <Stack direction="horizontal" align="center" justify="space-between">
          <AppText variant="label" color="secondary">
            {title}
          </AppText>
          {icon && (
            <View style={cardStyles.iconContainer}>
              <Ionicons name={icon} size={16} color={SemanticColors.text.secondary} />
            </View>
          )}
        </Stack>

        {/* Value or Stats List */}
        {stats ? (
          <Stack spacing="sm">
            {stats.map((stat, index) => (
              <Stack key={index} direction="horizontal" justify="space-between" align="center">
                <AppText variant="bodyLarge" color="secondary">
                  {stat.label}:
                </AppText>
                <AppText variant="bodyLarge" color="primary" style={{ fontWeight: '600' }}>
                  {stat.value}
                </AppText>
              </Stack>
            ))}
          </Stack>
        ) : value ? (
          <AppText variant="numericalLarge" color="primary">
            {value}
          </AppText>
        ) : null}

        {/* Subtitle */}
        {subtitle && (
          <AppText variant="caption" color="tertiary">
            {subtitle}
          </AppText>
        )}

        {/* Change indicator */}
        {change && (
          <Stack direction="horizontal" align="center" spacing="xs">
            <Ionicons 
              name={changeType === 'positive' ? 'trending-up' : changeType === 'negative' ? 'trending-down' : 'remove'} 
              size={14} 
              color={changeColor} 
            />
            <AppText variant="caption" style={{ color: changeColor }}>
              {change}
            </AppText>
          </Stack>
        )}
      </Stack>
    </Card>
  );
});

const cardStyles = {
  iconContainer: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.small,
    backgroundColor: SemanticColors.surface.secondary,
  },
};