import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { StatsTokens, Colors, Spacing, BorderRadius, Shadows } from '../../styles/designSystem';
import { AppText } from './Typography';

export interface InsightData {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  format?: 'number' | 'currency' | 'percentage' | 'time' | 'custom';
}

export interface KeyInsightsGridProps {
  insights: InsightData[];
  columns?: number;
  onInsightPress?: (insight: InsightData) => void;
  style?: ViewStyle;
}

export const KeyInsightsGrid: React.FC<KeyInsightsGridProps> = ({
  insights = [],
  columns = 2,
  onInsightPress,
  style,
}) => {
  const formatValue = (value: string | number, format: InsightData['format'] = 'custom'): string => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return `₹${value.toLocaleString('en-IN')}`;
      case 'percentage':
        return `${value}%`;
      case 'time':
        return `${value}h`;
      case 'number':
        return value.toLocaleString('en-IN');
      default:
        return value.toString();
    }
  };

  const getTrendIcon = (trend: InsightData['trend']) => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: InsightData['trend']) => {
    switch (trend) {
      case 'up':
        return Colors.success[600];
      case 'down':
        return Colors.error[600];
      default:
        return Colors.neutral[500];
    }
  };

  const renderInsightCard = (insight: InsightData, index: number) => {
    const cardColor = insight.color || Colors.primary[500];
    
    return (
      <TouchableOpacity
        key={insight.id}
        style={[
          styles.insightCard,
          {
            flex: 1,
            marginRight: (index + 1) % columns === 0 ? 0 : StatsTokens.insights.gridGap,
            marginBottom: Math.floor(index / columns) < Math.floor((insights.length - 1) / columns) 
              ? StatsTokens.insights.gridGap 
              : 0,
          }
        ]}
        onPress={() => onInsightPress?.(insight)}
        disabled={!onInsightPress}
        activeOpacity={0.7}
      >
        {/* Header with icon */}
        <View style={styles.cardHeader}>
          {insight.icon && (
            <View style={[styles.iconContainer, { backgroundColor: cardColor + '15' }]}>
              <Ionicons 
                name={insight.icon} 
                size={StatsTokens.insights.iconSize} 
                color={cardColor}
              />
            </View>
          )}
          
          {/* Trend indicator */}
          {insight.trend && insight.trendValue && (
            <View style={[styles.trendIndicator, { backgroundColor: getTrendColor(insight.trend) + '15' }]}>
              <Ionicons 
                name={getTrendIcon(insight.trend)} 
                size={12} 
                color={getTrendColor(insight.trend)}
              />
              <AppText 
                variant="caption" 
                style={[styles.trendText, { color: getTrendColor(insight.trend) }]}
              >
                {insight.trendValue}
              </AppText>
            </View>
          )}
        </View>

        {/* Value */}
        <View style={styles.valueContainer}>
          <AppText 
            variant="numericalLarge" 
            style={[styles.valueText, { color: cardColor }]}
          >
            {formatValue(insight.value, insight.format)}
          </AppText>
        </View>

        {/* Title and subtitle */}
        <View style={styles.labelContainer}>
          <AppText variant="label" style={styles.titleText}>
            {insight.title}
          </AppText>
          {insight.subtitle && (
            <AppText variant="caption" style={styles.subtitleText}>
              {insight.subtitle}
            </AppText>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderGrid = () => {
    const rows = [];
    for (let i = 0; i < insights.length; i += columns) {
      const rowItems = insights.slice(i, i + columns);
      
      rows.push(
        <View key={`row-${i}`} style={styles.row}>
          {rowItems.map((insight, index) => 
            renderInsightCard(insight, i + index)
          )}
          {/* Fill empty spots in the last row */}
          {rowItems.length < columns && (
            Array.from({ length: columns - rowItems.length }).map((_, emptyIndex) => (
              <View key={`empty-${emptyIndex}`} style={{ flex: 1 }} />
            ))
          )}
        </View>
      );
    }
    return rows;
  };

  if (!insights || insights.length === 0) {
    return (
      <View style={[styles.container, style, styles.emptyContainer]}>
        <AppText variant="bodySmall" color="secondary">
          No insights available
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {renderGrid()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
  } as ViewStyle,

  emptyContainer: {
    padding: Spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 120,
  } as ViewStyle,

  row: {
    flexDirection: 'row' as const,
  } as ViewStyle,

  insightCard: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    padding: StatsTokens.insights.cardPadding,
    minHeight: 120,
    justifyContent: 'space-between' as const,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    ...Shadows.soft,
  } as ViewStyle,

  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: Spacing.sm,
  } as ViewStyle,

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  } as ViewStyle,

  trendIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  } as ViewStyle,

  trendText: {
    marginLeft: 2,
    fontSize: 10,
    fontWeight: '600' as const,
  } as ViewStyle,

  valueContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  } as ViewStyle,

  valueText: {
    fontSize: StatsTokens.insights.valueSize,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  } as ViewStyle,

  labelContainer: {
    alignItems: 'center' as const,
  } as ViewStyle,

  titleText: {
    fontSize: StatsTokens.insights.labelSize,
    fontWeight: '600' as const,
    color: Colors.neutral[700],
    textAlign: 'center' as const,
  } as ViewStyle,

  subtitleText: {
    fontSize: 10,
    color: Colors.neutral[500],
    textAlign: 'center' as const,
    marginTop: 2,
  } as ViewStyle,
};