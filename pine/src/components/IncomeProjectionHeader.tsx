import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, Shadows } from '../styles/designSystem';
import { formatIndianNumber, getValueDisplayWithSign } from '../utils/indianNumberFormat';
import { AppText, Stack, Card } from './ui';

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
    if (todayValue > 50000) return { icon: '📈', color: Colors.success[600], text: 'Excellent pace!' };
    if (todayValue > 20000) return { icon: '📊', color: Colors.primary[500], text: 'Good progress' };
    if (todayValue > 0) return { icon: '🎯', color: Colors.warning[600], text: 'Keep building' };
    return { icon: '⭐', color: Colors.neutral[400], text: 'Ready to start' };
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
        colors={[Colors.primary[500] + '15', Colors.primary[300] + '10', 'transparent']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Compact Progress Visualizer */}
        <Card variant="outlined" padding="small" style={{ marginBottom: Spacing.sm }}>
          <Stack spacing="xs">
            <Stack direction="horizontal" justify="space-between" align="center">
              <AppText variant="caption" color="primary" style={{ fontWeight: '600' }}>
                Daily Progress
              </AppText>
              <AppText variant="caption" color="secondary">
                {filledSlots}/{totalSlots} hours
              </AppText>
            </Stack>
            
            <Stack direction="horizontal" align="center" spacing="sm">
              <View style={styles.progressTrack}>
                <View 
                  style={[
                    styles.filledProgress,
                    { width: `${(filledSlots / totalSlots) * 100}%` }
                  ]} 
                />
              </View>
              <AppText variant="caption" color="primary" style={{ fontWeight: 'bold', minWidth: 40, textAlign: 'right' }}>
                {Math.round((filledSlots / totalSlots) * 100)}%
              </AppText>
            </Stack>
            
            <Stack direction="horizontal" justify="space-around">
              <AppText variant="caption" color="tertiary" style={{ fontSize: 10 }}>
                • {totalSlots - filledSlots} empty
              </AppText>
              <AppText variant="caption" color="tertiary" style={{ fontSize: 10 }}>
                • {zeroValueSlots} zero value
              </AppText>
            </Stack>
          </Stack>
        </Card>

        <Stack align="center" spacing="xs" style={{ marginBottom: Spacing.sm }}>
          <Stack direction="horizontal" justify="space-between" align="center" style={{ width: '100%' }}>
            <AppText variant="bodySmall" color="secondary" style={{ fontWeight: '500' }}>
              Annual Projection
            </AppText>
            <TouchableOpacity 
              onPress={onInfoPress} 
              style={styles.infoButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Learn more about projection calculation"
              accessibilityRole="button"
            >
              <Ionicons name="information-circle" size={16} color={Colors.primary[500]} />
            </TouchableOpacity>
          </Stack>
          <AppText variant="heading2" color="primary" align="center" style={{ fontWeight: 'bold' }}>
            {annualProjection}
          </AppText>
        </Stack>

        {/* Today's performance */}
        <Card variant="elevated" padding="small" style={{ ...Shadows.soft }}>
          <Stack spacing="xs">
            <Stack direction="horizontal" justify="space-between" align="center">
              <Stack align="center" style={{ flex: 1 }}>
                <AppText variant="heading3" style={{ color: todayValueDisplay.color, fontWeight: 'bold', marginBottom: 2 }}>
                  {todayValueDisplay.text}
                </AppText>
                <AppText variant="caption" color="secondary" style={{ fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Today
                </AppText>
              </Stack>
              
              <View style={styles.statDivider} />
              
              <Stack align="center" style={{ flex: 1 }}>
                <AppText variant="heading3" color="primary" style={{ fontWeight: 'bold', marginBottom: 2 }}>
                  {todayActivityCount}
                </AppText>
                <AppText variant="caption" color="secondary" style={{ fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Activities
                </AppText>
              </Stack>
              
              <View style={styles.statDivider} />
              
              <Stack align="center" style={{ flex: 1 }}>
                <AppText variant="heading3" color="success" style={{ fontWeight: 'bold', marginBottom: 2 }}>
                  {highValuePercentage}%
                </AppText>
                <AppText variant="caption" color="secondary" style={{ fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  High-value
                </AppText>
              </Stack>
            </Stack>

            {/* Progress indicator */}
            <Stack direction="horizontal" align="center" justify="center">
              <AppText style={{ fontSize: 16, marginRight: Spacing.sm }}>{trend.icon}</AppText>
              <AppText variant="bodySmall" style={{ color: trend.color, fontWeight: '600' }}>
                {trend.text}
              </AppText>
            </Stack>
          </Stack>
        </Card>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = {
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: 16,
    overflow: 'hidden' as const,
    ...Shadows.medium,
  },
  gradientBackground: {
    backgroundColor: Colors.neutral[50],
    padding: Spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  filledProgress: {
    height: 8,
    backgroundColor: Colors.primary[500],
  },
  infoButton: {
    padding: Spacing.xs,
    borderRadius: 8,
    backgroundColor: Colors.primary[100],
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: Spacing.md,
  },
};

export default IncomeProjectionHeader;