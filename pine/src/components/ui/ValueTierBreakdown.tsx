import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { StatsTokens, Colors, Spacing, BorderRadius, getActivityLevelInfo } from '../../styles/designSystem';
import { AppText } from './Typography';
import { formatIndianNumber } from '../../utils/indianNumberFormat';

export interface ValueTierData {
  tier: 'ceo' | 'executive' | 'highValue' | 'professional' | 'basic' | 'lowValue' | 'free' | 'negative';
  hours: number;
  value: number;
  activityCount?: number;
}

export interface ValueTierBreakdownProps {
  data: ValueTierData[];
  showHours?: boolean;
  showActivityCount?: boolean;
  onTierPress?: (tier: ValueTierData) => void;
  style?: ViewStyle;
}

export const ValueTierBreakdown: React.FC<ValueTierBreakdownProps> = ({
  data = [],
  showHours = true,
  showActivityCount = false,
  onTierPress,
  style,
}) => {
  const getTierInfo = (tier: ValueTierData['tier']) => {
    // Map tier names to value ranges for getting proper info
    const tierValueMap = {
      ceo: 2000000,
      executive: 200000,
      highValue: 20000,
      professional: 2000,
      basic: 200,
      lowValue: 100,
      free: 0,
      negative: -100
    };
    
    const levelInfo = getActivityLevelInfo(tierValueMap[tier]);
    return {
      ...levelInfo,
      color: StatsTokens.tiers[tier]
    };
  };

  const renderTierRow = (tierData: ValueTierData, index: number) => {
    const tierInfo = getTierInfo(tierData.tier);
    const isActive = tierData.hours > 0 || tierData.value > 0;

    return (
      <TouchableOpacity
        key={`${tierData.tier}-${index}`}
        style={[
          styles.tierRow,
          !isActive && styles.inactiveTierRow,
          { borderLeftColor: tierInfo.color }
        ]}
        onPress={() => onTierPress?.(tierData)}
        disabled={!onTierPress || !isActive}
        activeOpacity={0.7}
      >
        {/* Left border accent */}
        <View style={[styles.tierAccent, { backgroundColor: tierInfo.color }]} />

        {/* Tier information */}
        <View style={styles.tierInfo}>
          <View style={styles.tierHeader}>
            <AppText variant="bodyRegular" style={[styles.tierLabel, !isActive && styles.inactiveText]}>
              {tierInfo.icon} {tierInfo.level}
            </AppText>
            {showActivityCount && tierData.activityCount !== undefined && (
              <AppText variant="caption" style={styles.activityCount}>
                {tierData.activityCount} activities
              </AppText>
            )}
          </View>

          {/* Time and stats */}
          <View style={styles.tierStats}>
            {showHours && (
              <AppText variant="caption" style={[styles.tierTime, !isActive && styles.inactiveText]}>
                {tierData.hours > 0 ? `${tierData.hours.toFixed(1)}h` : '0h'}
              </AppText>
            )}
            
            {/* Additional separator */}
            {showHours && tierData.hours > 0 && (
              <AppText variant="caption" style={styles.separator}>
                •
              </AppText>
            )}
            
            {/* Average rate if hours > 0 */}
            {tierData.hours > 0 && (
              <AppText variant="caption" style={[styles.tierRate, !isActive && styles.inactiveText]}>
                ₹{formatIndianNumber(Math.round(tierData.value / tierData.hours))}/hr
              </AppText>
            )}
          </View>
        </View>

        {/* Value display */}
        <View style={styles.tierValue}>
          <AppText 
            variant="numerical" 
            style={[
              styles.valueText,
              { color: isActive ? tierInfo.color : Colors.neutral[400] },
              tierData.value < 0 && styles.negativeValue
            ]}
          >
            {tierData.value >= 0 ? '+' : ''}₹{formatIndianNumber(Math.abs(tierData.value))}
          </AppText>
        </View>
      </TouchableOpacity>
    );
  };

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, style, styles.emptyContainer]}>
        <AppText variant="bodySmall" color="secondary">
          No tier data available
        </AppText>
      </View>
    );
  }

  // Sort tiers by value (highest first)
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <View style={[styles.container, style]}>
      {sortedData.map(renderTierRow)}
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: Colors.neutral[0],
  } as ViewStyle,

  emptyContainer: {
    padding: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 100,
  } as ViewStyle,

  tierRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderLeftWidth: 4,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    position: 'relative' as const,
    minHeight: 60,
  } as ViewStyle,

  inactiveTierRow: {
    backgroundColor: Colors.neutral[50],
    opacity: 0.6,
  } as ViewStyle,

  tierAccent: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  } as ViewStyle,

  tierInfo: {
    flex: 1,
    paddingLeft: Spacing.sm,
  } as ViewStyle,

  tierHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 4,
  } as ViewStyle,

  tierLabel: {
    fontWeight: '600' as const,
    flex: 1,
  } as ViewStyle,

  activityCount: {
    color: Colors.neutral[500],
    fontSize: 11,
  } as ViewStyle,

  tierStats: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  } as ViewStyle,

  tierTime: {
    color: Colors.neutral[600],
    fontWeight: '500' as const,
  } as ViewStyle,

  separator: {
    color: Colors.neutral[400],
    marginHorizontal: Spacing.xs,
  } as ViewStyle,

  tierRate: {
    color: Colors.neutral[600],
    fontWeight: '500' as const,
  } as ViewStyle,

  tierValue: {
    alignItems: 'flex-end' as const,
    paddingLeft: Spacing.sm,
  } as ViewStyle,

  valueText: {
    fontWeight: '700' as const,
    fontSize: 16,
  } as ViewStyle,

  negativeValue: {
    color: Colors.error[600],
  } as ViewStyle,

  inactiveText: {
    color: Colors.neutral[400],
  } as ViewStyle,
};