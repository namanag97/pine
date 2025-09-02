import React, { memo, useMemo } from 'react';
import { ViewStyle } from 'react-native';
import { Colors, SemanticColors, BorderRadius, Spacing } from '../../styles/designSystem';
import { AppText } from './Typography';
import { Stack } from './Layout';

export interface ValueBadgeProps {
  value: number;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: ViewStyle;
}

export const ValueBadge: React.FC<ValueBadgeProps> = memo(({
  value,
  size = 'medium',
  showIcon = false,
  style,
}) => {
  const { backgroundColor, textColor, icon } = useMemo(() => {
    if (value >= 2000000) {
      return {
        backgroundColor: Colors.premium[600], // Gold for CEO level
        textColor: Colors.neutral[900],
        icon: '👑'
      };
    } else if (value >= 200000) {
      return {
        backgroundColor: Colors.primary[600], // Blue for Executive
        textColor: Colors.neutral[0],
        icon: '🎯'
      };
    } else if (value >= 20000) {
      return {
        backgroundColor: Colors.success[600], // Green for High-Value
        textColor: Colors.neutral[0],
        icon: '💼'
      };
    } else if (value >= 2000) {
      return {
        backgroundColor: Colors.primary[400], // Light blue for Professional
        textColor: Colors.neutral[0],
        icon: '💻'
      };
    } else if (value >= 200) {
      return {
        backgroundColor: Colors.neutral[500], // Gray for Basic
        textColor: Colors.neutral[0],
        icon: '📋'
      };
    } else if (value >= 100) {
      return {
        backgroundColor: Colors.neutral[400], // Light gray for Low-Value
        textColor: Colors.neutral[0],
        icon: '📝'
      };
    } else if (value === 0) {
      return {
        backgroundColor: Colors.neutral[500], // Gray for Free
        textColor: Colors.neutral[0],
        icon: '📱'
      };
    } else {
      return {
        backgroundColor: Colors.error[600], // Red for Negative
        textColor: Colors.neutral[0],
        icon: '⚠️'
      };
    }
  }, [value]);

  const badgeStyle = useMemo((): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor,
      borderRadius: BorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (size) {
      case 'small':
        return {
          ...baseStyle,
          paddingHorizontal: Spacing.xs,
          paddingVertical: 2,
        };
      case 'large':
        return {
          ...baseStyle,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.xs,
        };
      default: // medium
        return {
          ...baseStyle,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 4,
        };
    }
  }, [backgroundColor, size]);

  const textVariant = useMemo(() => {
    switch (size) {
      case 'small': return 'caption';
      case 'large': return 'bodySmall';
      default: return 'caption';
    }
  }, [size]);

  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(0)}M`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    } else if (value < 0) {
      return `-₹${Math.abs(value)}`;
    } else {
      return `₹${value}`;
    }
  };

  const combinedStyle = useMemo(() => ({
    ...badgeStyle,
    ...style,
  }), [badgeStyle, style]);

  return (
    <Stack 
      direction="horizontal" 
      align="center" 
      spacing="xs" 
      style={combinedStyle}
    >
      {showIcon && (
        <AppText 
          variant={textVariant} 
          style={{ color: textColor, fontSize: size === 'small' ? 8 : 10 }}
        >
          {icon}
        </AppText>
      )}
      <AppText 
        variant={textVariant} 
        style={{ color: textColor, fontWeight: '600' }}
      >
        {formatValue(value)}
      </AppText>
    </Stack>
  );
});

ValueBadge.displayName = 'ValueBadge';