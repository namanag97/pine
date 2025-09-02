import React, { useEffect, useState } from 'react';
import { View, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { StatsTokens, Colors, Spacing, EnhancedAnimation } from '../../styles/designSystem';
import { AppText } from './Typography';

export interface EfficiencyMeterProps {
  percentage: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
  showLabel?: boolean;
  label?: string;
  subtitle?: string;
  style?: ViewStyle;
}

export const EfficiencyMeter: React.FC<EfficiencyMeterProps> = ({
  percentage = 0,
  size = StatsTokens.efficiency.size,
  strokeWidth = StatsTokens.efficiency.strokeWidth,
  color = StatsTokens.efficiency.foregroundColor,
  backgroundColor = StatsTokens.efficiency.backgroundColor,
  animated = true,
  showLabel = true,
  label = 'EFFICIENCY',
  subtitle,
  style,
}) => {
  const [animatedValue] = useState(new Animated.Value(0));
  
  // Clamp percentage between 0 and 100
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: normalizedPercentage / 100,
        duration: StatsTokens.efficiency.animationDuration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(normalizedPercentage / 100);
    }
  }, [normalizedPercentage, animated]);

  // Create the circular progress using animated rotation
  const animatedStrokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const getEfficiencyColor = (pct: number): string => {
    if (pct >= 80) return Colors.success[600];
    if (pct >= 60) return Colors.warning[500];
    if (pct >= 40) return Colors.warning[600];
    return Colors.error[500];
  };

  const getEfficiencyMessage = (pct: number): string => {
    if (pct >= 90) return 'Exceptional! 🎯';
    if (pct >= 80) return 'Great job! 💪';
    if (pct >= 70) return 'Good progress! 👍';
    if (pct >= 60) return 'Keep improving! 📈';
    if (pct >= 40) return 'Room for growth 🌱';
    return 'Focus needed 🔍';
  };

  const dynamicColor = color || getEfficiencyColor(normalizedPercentage);

  return (
    <View style={[styles.container, style]}>
      {/* Circular Progress Ring */}
      <View style={[styles.progressContainer, { width: size, height: size }]}>
        {/* Background Circle */}
        <View
          style={[
            styles.backgroundCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            }
          ]}
        />

        {/* Progress Circle - Using transforms to create arc */}
        <Animated.View
          style={[
            styles.progressCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: dynamicColor,
              transform: [
                { rotate: '-90deg' }, // Start from top
                {
                  rotate: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }
          ]}
        />

        {/* Gradient Overlay for better visual effect */}
        <View style={[styles.gradientContainer, { width: size, height: size, borderRadius: size / 2 }]}>
          <LinearGradient
            colors={[dynamicColor + '20', 'transparent']}
            style={styles.gradientOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>

        {/* Center Content */}
        <View style={[styles.centerContent, { width: size - strokeWidth * 2, height: size - strokeWidth * 2 }]}>
          <AppText 
            variant="numericalLarge" 
            style={[styles.percentageText, { color: dynamicColor }]}
          >
            {Math.round(normalizedPercentage)}%
          </AppText>
          
          {showLabel && (
            <AppText variant="caption" style={styles.labelText}>
              {label}
            </AppText>
          )}
        </View>
      </View>

      {/* Progress Bar (Linear representation) */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: dynamicColor,
              }
            ]}
          />
        </View>
      </View>

      {/* Efficiency Message */}
      <View style={styles.messageContainer}>
        <AppText variant="bodySmall" style={[styles.messageText, { color: dynamicColor }]}>
          {getEfficiencyMessage(normalizedPercentage)}
        </AppText>
        {subtitle && (
          <AppText variant="caption" style={styles.subtitleText}>
            {subtitle}
          </AppText>
        )}
      </View>
    </View>
  );
};

const styles = {
  container: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: Spacing.lg,
  } as ViewStyle,

  progressContainer: {
    position: 'relative' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  } as ViewStyle,

  backgroundCircle: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
  } as ViewStyle,

  progressCircle: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  } as ViewStyle,

  gradientContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    overflow: 'hidden' as const,
  } as ViewStyle,

  gradientOverlay: {
    flex: 1,
  } as ViewStyle,

  centerContent: {
    position: 'absolute' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: Colors.neutral[0],
    borderRadius: 1000, // Large radius for circle
  } as ViewStyle,

  percentageText: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 2,
  } as ViewStyle,

  labelText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.neutral[500],
    letterSpacing: 0.5,
  } as ViewStyle,

  progressBarContainer: {
    width: '100%',
    marginTop: Spacing.lg,
  } as ViewStyle,

  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden' as const,
  } as ViewStyle,

  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  } as ViewStyle,

  messageContainer: {
    alignItems: 'center' as const,
    marginTop: Spacing.md,
  } as ViewStyle,

  messageText: {
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 4,
  } as ViewStyle,

  subtitleText: {
    color: Colors.neutral[500],
    textAlign: 'center' as const,
  } as ViewStyle,
};