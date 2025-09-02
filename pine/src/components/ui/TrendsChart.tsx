import React, { useEffect, useState } from 'react';
import { View, Animated, ViewStyle, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ChartTokens, Colors, EnhancedAnimation, Spacing } from '../../styles/designSystem';
import { AppText } from './Typography';
import { formatIndianNumber } from '../../utils/indianNumberFormat';

export interface TrendsChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TrendsChartProps {
  data: TrendsChartDataPoint[];
  height?: number;
  showValues?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  onBarPress?: (dataPoint: TrendsChartDataPoint, index: number) => void;
  style?: ViewStyle;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({
  data = [],
  height = ChartTokens.dimensions.barMaxHeight,
  showValues = true,
  showLabels = true,
  animated = true,
  onBarPress,
  style,
}) => {
  const [animatedValues] = useState(() => 
    data.map(() => new Animated.Value(0))
  );

  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.value), 1);

  useEffect(() => {
    if (animated) {
      // Staggered animation for bars
      const animations = animatedValues.map((animValue, index) => 
        Animated.timing(animValue, {
          toValue: 1,
          duration: ChartTokens.animation.barGrowDuration,
          delay: index * ChartTokens.animation.staggerDelay,
          useNativeDriver: false,
        })
      );

      Animated.stagger(ChartTokens.animation.staggerDelay, animations).start();
    } else {
      // Set to final values immediately
      animatedValues.forEach(animValue => animValue.setValue(1));
    }
  }, [data, animated]);

  const renderBar = (dataPoint: TrendsChartDataPoint, index: number) => {
    const barHeight = (dataPoint.value / maxValue) * (height - 60); // Reserve space for labels
    const animatedHeight = animatedValues[index].interpolate({
      inputRange: [0, 1],
      outputRange: [ChartTokens.dimensions.barMinHeight, barHeight],
    });

    const animatedOpacity = animatedValues[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    const barColor = dataPoint.color || ChartTokens.colors.chart1;

    return (
      <TouchableOpacity
        key={`${dataPoint.label}-${index}`}
        style={styles.barContainer}
        onPress={() => onBarPress?.(dataPoint, index)}
        disabled={!onBarPress}
        activeOpacity={0.7}
      >
        {/* Value label above bar */}
        {showValues && (
          <Animated.View 
            style={[
              styles.valueLabel,
              { opacity: animatedOpacity }
            ]}
          >
            <AppText variant="caption" style={styles.valueText}>
              ₹{formatIndianNumber(dataPoint.value)}
            </AppText>
          </Animated.View>
        )}

        {/* Bar with gradient */}
        <Animated.View 
          style={[
            styles.barWrapper,
            { height: animatedHeight, opacity: animatedOpacity }
          ]}
        >
          <LinearGradient
            colors={[barColor, barColor + 'CC']} // Add transparency to create gradient effect
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.bar}
          />
        </Animated.View>

        {/* Label below bar */}
        {showLabels && (
          <View style={styles.labelContainer}>
            <AppText variant="caption" style={styles.labelText}>
              {dataPoint.label}
            </AppText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, style, styles.emptyContainer]}>
        <AppText variant="bodySmall" color="secondary">
          No data available
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.container, style, { height }]}>
      <View style={styles.chartContainer}>
        {data.map(renderBar)}
      </View>
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: Spacing.lg,
    justifyContent: 'flex-end' as const,
  } as ViewStyle,

  emptyContainer: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    minHeight: 100,
  } as ViewStyle,

  chartContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    justifyContent: 'space-around' as const,
    height: '100%',
  } as ViewStyle,

  barContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    marginHorizontal: 4,
  } as ViewStyle,

  barWrapper: {
    width: ChartTokens.dimensions.barWidth,
    borderRadius: 4,
    overflow: 'hidden' as const,
    justifyContent: 'flex-end' as const,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  bar: {
    flex: 1,
    minHeight: ChartTokens.dimensions.barMinHeight,
    borderRadius: 4,
  } as ViewStyle,

  valueLabel: {
    position: 'absolute' as const,
    top: -25,
    alignItems: 'center' as const,
    zIndex: 1,
  } as ViewStyle,

  valueText: {
    fontWeight: '600' as const,
    color: Colors.neutral[700],
    fontSize: 10,
  } as ViewStyle,

  labelContainer: {
    marginTop: Spacing.sm,
    alignItems: 'center' as const,
  } as ViewStyle,

  labelText: {
    fontWeight: '500' as const,
    color: Colors.neutral[600],
    fontSize: 10,
    textAlign: 'center' as const,
  } as ViewStyle,
};