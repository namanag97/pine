import React, { memo, useState, useMemo } from 'react';
import { TouchableOpacity, ViewStyle, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  Colors, 
  SemanticColors, 
  Spacing, 
  BorderRadius,
  Shadows 
} from '../../styles/designSystem';
import { AppText } from './Typography';
import { Stack } from './Layout';

export interface CategorySectionProps {
  title: string;
  icon?: string;
  valueRange: string;
  activityCount: number;
  backgroundColor: string;
  textColor: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const CategorySection: React.FC<CategorySectionProps> = memo(({
  title,
  icon,
  valueRange,
  activityCount,
  backgroundColor,
  textColor,
  children,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [animation] = useState(new Animated.Value(defaultExpanded ? 1 : 0));

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const headerStyle = useMemo((): ViewStyle => ({
    backgroundColor,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.md,
    ...Shadows.soft,
  }), [backgroundColor]);

  const contentStyle = {
    overflow: 'hidden' as const,
    maxHeight: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1000], // Large enough max height for content
    }),
    opacity: animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    }),
  };

  const chevronRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Stack spacing="xs">
      {/* Category Header */}
      <TouchableOpacity 
        style={headerStyle} 
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <Stack direction="horizontal" align="center" justify="space-between">
          <Stack direction="horizontal" align="center" spacing="sm">
            {icon && (
              <AppText variant="bodyLarge" style={{ color: textColor }}>
                {icon}
              </AppText>
            )}
            <Stack spacing="xs">
              <AppText 
                variant="bodyLarge" 
                style={{ color: textColor, fontWeight: '600' }}
              >
                {title}
              </AppText>
              <AppText 
                variant="caption" 
                style={{ color: textColor, opacity: 0.8 }}
              >
                {valueRange} • {activityCount} activities
              </AppText>
            </Stack>
          </Stack>
          
          <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={textColor} 
            />
          </Animated.View>
        </Stack>
      </TouchableOpacity>

      {/* Category Content */}
      <Animated.View style={contentStyle}>
        {children}
      </Animated.View>
    </Stack>
  );
});

CategorySection.displayName = 'CategorySection';

// Helper function to get category colors based on value tier
export const getCategoryColors = (minValue: number) => {
  if (minValue >= 2000000) {
    return {
      backgroundColor: Colors.premium[600],
      textColor: Colors.neutral[900],
    };
  } else if (minValue >= 200000) {
    return {
      backgroundColor: Colors.primary[600],
      textColor: Colors.neutral[0],
    };
  } else if (minValue >= 20000) {
    return {
      backgroundColor: Colors.success[600],
      textColor: Colors.neutral[0],
    };
  } else if (minValue >= 2000) {
    return {
      backgroundColor: Colors.primary[500],
      textColor: Colors.neutral[0],
    };
  } else if (minValue >= 200) {
    return {
      backgroundColor: Colors.neutral[500],
      textColor: Colors.neutral[0],
    };
  } else if (minValue >= 100) {
    return {
      backgroundColor: Colors.neutral[400],
      textColor: Colors.neutral[0],
    };
  } else if (minValue === 0) {
    return {
      backgroundColor: Colors.neutral[500],
      textColor: Colors.neutral[0],
    };
  } else {
    return {
      backgroundColor: Colors.error[600],
      textColor: Colors.neutral[0],
    };
  }
};

// Helper function to get category info based on value tier
export const getCategoryInfo = (minValue: number) => {
  if (minValue >= 2000000) {
    return {
      title: 'CEO-Level Tasks',
      icon: '👑',
      valueRange: '₹2M+',
    };
  } else if (minValue >= 200000) {
    return {
      title: 'Executive Tasks',
      icon: '🎯',
      valueRange: '₹200K - ₹2M',
    };
  } else if (minValue >= 20000) {
    return {
      title: 'High-Value Tasks',
      icon: '💼',
      valueRange: '₹20K - ₹200K',
    };
  } else if (minValue >= 2000) {
    return {
      title: 'Professional Tasks',
      icon: '💻',
      valueRange: '₹2K - ₹20K',
    };
  } else if (minValue >= 200) {
    return {
      title: 'Basic Tasks',
      icon: '📋',
      valueRange: '₹200 - ₹2K',
    };
  } else if (minValue >= 100) {
    return {
      title: 'Low-Value Tasks',
      icon: '📝',
      valueRange: '₹100 - ₹200',
    };
  } else if (minValue === 0) {
    return {
      title: 'Free Activities',
      icon: '📱',
      valueRange: '₹0',
    };
  } else {
    return {
      title: 'Costly Activities',
      icon: '⚠️',
      valueRange: 'Negative Value',
    };
  }
};