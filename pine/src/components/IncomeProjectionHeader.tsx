import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/designSystem';
import { formatIndianNumber, getValueDisplayWithSign } from '../utils/indianNumberFormat';

interface IncomeProjectionHeaderProps {
  annualProjection: string;
  todayValue: number;
  todayActivityCount: number;
  highValuePercentage: number;
  totalSlots: number;
  filledSlots: number;
  zeroValueSlots: number;
  onInfoPress: () => void;
}

const IncomeProjectionHeader: React.FC<IncomeProjectionHeaderProps> = ({
  annualProjection,
  todayValue,
  todayActivityCount,
  highValuePercentage,
  totalSlots,
  filledSlots,
  zeroValueSlots,
  onInfoPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const todayValueDisplay = getValueDisplayWithSign(todayValue);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [annualProjection]);


  const getProjectionTrend = () => {
    if (todayValue > 50000) return { icon: '📈', color: Colors.successGreen, text: 'Excellent pace!' };
    if (todayValue > 20000) return { icon: '📊', color: Colors.primaryBlue, text: 'Good progress' };
    if (todayValue > 0) return { icon: '🎯', color: Colors.premiumGold, text: 'Keep building' };
    return { icon: '⭐', color: Colors.shadowGray, text: 'Ready to start' };
  };

  const trend = getProjectionTrend();

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim, 
          transform: [{ scale: scaleAnim }] 
        }
      ]}
    >
      <LinearGradient
        colors={[Colors.primaryBlue + '15', Colors.skyBlue + '10', 'transparent']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Main projection display */}
        {/* Compact Progress Visualizer */}
        <View style={styles.progressVisualizerContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Daily Progress</Text>
            <Text style={styles.progressStats}>{filledSlots}/{totalSlots} hours</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.filledProgress,
                  { width: `${(filledSlots / totalSlots) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressPercent}>
              {Math.round((filledSlots / totalSlots) * 100)}%
            </Text>
          </View>
          <View style={styles.progressLegend}>
            <Text style={styles.legendItem}>• {totalSlots - filledSlots} empty</Text>
            <Text style={styles.legendItem}>• {zeroValueSlots} zero value</Text>
          </View>
        </View>

        <View style={styles.projectionContainer}>
          <View style={styles.projectionHeader}>
            <Text style={styles.projectionLabel}>Annual Projection</Text>
            <TouchableOpacity 
              onPress={onInfoPress} 
              style={styles.infoButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="information-circle" size={16} color={Colors.primaryBlue} />
            </TouchableOpacity>
          </View>
          <Text style={styles.projectionAmount}>{annualProjection}</Text>
        </View>

        {/* Today's performance */}
        <View style={styles.todayContainer}>
          <View style={styles.todayStats}>
            <View style={styles.statItem}>
              <Text style={[styles.todayAmount, { color: todayValueDisplay.color }]}>
                {todayValueDisplay.text}
              </Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.activityCount}>
                {todayActivityCount}
              </Text>
              <Text style={styles.statLabel}>Activities</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.percentage}>
                {highValuePercentage}%
              </Text>
              <Text style={styles.statLabel}>High-value</Text>
            </View>
          </View>

          {/* Progress indicator */}
          <View style={styles.trendIndicator}>
            <Text style={styles.trendIcon}>{trend.icon}</Text>
            <Text style={[styles.trendText, { color: trend.color }]}>
              {trend.text}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.large,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  gradientBackground: {
    backgroundColor: Colors.cloudWhite,
    padding: Spacing.sm, // Further reduced from md
  },
  progressVisualizerContainer: {
    backgroundColor: Colors.skyBlue + '10',
    borderRadius: BorderRadius.small,
    padding: Spacing.xs, // Reduced from sm
    marginBottom: Spacing.sm, // Reduced from md
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  progressTitle: {
    ...Typography.caption,
    color: Colors.primaryBlue,
    fontWeight: '600',
  },
  progressStats: {
    ...Typography.caption,
    color: Colors.shadowGray,
    fontWeight: '500',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.mistGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  filledProgress: {
    height: '100%',
    backgroundColor: Colors.primaryBlue,
  },
  progressPercent: {
    ...Typography.caption,
    color: Colors.primaryBlue,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },
  progressLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    ...Typography.caption,
    color: Colors.shadowGray,
    fontSize: 10,
  },
  projectionContainer: {
    alignItems: 'center',
    marginBottom: Spacing.sm, // Further reduced from md
  },
  projectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.xs,
  },
  infoButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.small,
    backgroundColor: Colors.primaryBlue + '10',
  },
  projectionLabel: {
    ...Typography.bodySmall,
    color: Colors.shadowGray,
    fontWeight: '500',
  },
  projectionAmount: {
    ...Typography.headline,
    fontSize: 20, // Even smaller
    color: Colors.primaryBlue,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  todayContainer: {
    backgroundColor: Colors.cloudWhite + '80',
    borderRadius: BorderRadius.medium,
    padding: Spacing.sm, // Further reduced from md
    ...Shadows.soft,
  },
  todayStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs, // Further reduced from md
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.mistGray,
    marginHorizontal: Spacing.md,
  },
  todayAmount: {
    ...Typography.headline,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  activityCount: {
    ...Typography.headline,
    color: Colors.primaryBlue,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  percentage: {
    ...Typography.headline,
    color: Colors.successGreen,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.shadowGray,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  trendText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
});

export default IncomeProjectionHeader;