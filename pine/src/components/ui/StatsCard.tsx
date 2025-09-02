import React, { memo } from 'react';
import { ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Colors,
  Spacing, 
  BorderRadius,
  Shadows
} from '../../styles/designSystem';
import { AppText, CurrencyText } from './Typography';
import { Stack } from './Layout';

export interface StatsCardProps {
  todayProjection: number;
  annualProjection: number;
  averageHourlyRate: number;
  efficiency: number;
  style?: ViewStyle;
}

export const StatsCard: React.FC<StatsCardProps> = memo(({
  todayProjection,
  annualProjection,
  averageHourlyRate,
  efficiency,
  style,
}) => {
  const formatProjection = (value: number): string => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    } else {
      return `₹${value.toLocaleString()}`;
    }
  };

  const formatHourlyRate = (value: number): string => {
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K/hr`;
    } else {
      return `₹${value}/hr`;
    }
  };

  return (
    <LinearGradient
      colors={[Colors.primary[600], Colors.success[600]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[statsCardStyles.container, style]}
    >
      <Stack spacing="md">
        {/* Main Projections */}
        <Stack direction="horizontal" justify="space-between" align="flex-start">
          <Stack spacing="xs">
            <AppText 
              variant="bodySmall" 
              style={{ color: Colors.neutral[100], opacity: 0.9 }}
            >
              Today's Projection
            </AppText>
            <CurrencyText 
              value={todayProjection}
              variant="numericalLarge"
              style={{ 
                color: Colors.neutral[0], 
                fontWeight: '700',
                fontSize: 28,
                lineHeight: 32
              }}
            />
          </Stack>
          
          <Stack spacing="xs" align="flex-end">
            <AppText 
              variant="caption" 
              style={{ color: Colors.neutral[100], opacity: 0.75 }}
            >
              Annual
            </AppText>
            <AppText 
              variant="bodyLarge" 
              style={{ 
                color: Colors.neutral[0], 
                fontWeight: '600',
                fontSize: 18
              }}
            >
              {formatProjection(annualProjection)}
            </AppText>
          </Stack>
        </Stack>

        {/* Stats Row */}
        <Stack direction="horizontal" justify="space-between" align="center">
          <Stack direction="horizontal" align="center" spacing="xs">
            <AppText 
              variant="bodySmall" 
              style={{ color: Colors.neutral[100], opacity: 0.9 }}
            >
              📊 Avg:
            </AppText>
            <AppText 
              variant="bodySmall" 
              style={{ 
                color: Colors.neutral[0], 
                fontWeight: '600'
              }}
            >
              {formatHourlyRate(averageHourlyRate)}
            </AppText>
          </Stack>
          
          <Stack direction="horizontal" align="center" spacing="xs">
            <AppText 
              variant="bodySmall" 
              style={{ color: Colors.neutral[100], opacity: 0.9 }}
            >
              🎯 Efficiency:
            </AppText>
            <AppText 
              variant="bodySmall" 
              style={{ 
                color: Colors.neutral[0], 
                fontWeight: '600'
              }}
            >
              {efficiency}%
            </AppText>
          </Stack>
        </Stack>
      </Stack>
    </LinearGradient>
  );
});

StatsCard.displayName = 'StatsCard';

const statsCardStyles = {
  container: {
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.large,
  } as ViewStyle,
};