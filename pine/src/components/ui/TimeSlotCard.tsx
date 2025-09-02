import React from 'react';
import { TouchableOpacity, ViewStyle, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Activity, TimeSlot } from '../../types';

export interface TimeSlotCardProps {
  timeSlot: TimeSlot;
  onPress: () => void;
  style?: ViewStyle;
  isCurrentSlot?: boolean;
}

export const TimeSlotCard: React.FC<TimeSlotCardProps> = ({
  timeSlot,
  onPress,
  style,
  isCurrentSlot = false,
}) => {
  
  const getValueTierBorderColor = (activity: Activity): string => {
    const value = activity.hourlyValue;
    
    if (value >= 2000000) return '#FDD835'; // CEO Level - Gold
    if (value >= 200000) return '#1E88E5';  // Executive - Blue  
    if (value >= 20000) return '#43A047';   // High Value - Green
    if (value >= 2000) return '#42A5F5';    // Professional - Light Blue
    if (value >= 200) return '#9E9E9E';     // Basic - Gray
    if (value > 0) return '#BDBDBD';        // Low Value - Light Gray
    if (value === 0) return '#9E9E9E';      // Free - Gray
    return '#E53935';                       // Negative - Red
  };

  const formatValue = (value: number): string => {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(0)}M/hr`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K/hr`;
    if (value < 0) return `-₹${Math.abs(value)}/hr`;
    return `₹${value}/hr`;
  };

  if (!timeSlot.activity) {
    // Empty slot - matching HTML .activity-card.empty
    return (
      <TouchableOpacity
        style={[
          emptyCardStyles.container, 
          isCurrentSlot && emptyCardStyles.current,
          style
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="add" 
          size={20} 
          color={isCurrentSlot ? "#16A34A" : "#9E9E9E"}
          style={{ marginRight: 8 }}
        />
        <Text style={[
          emptyCardStyles.text,
          isCurrentSlot && emptyCardStyles.currentText
        ]}>
          {isCurrentSlot ? "What are you doing now?" : "Add Activity"}
        </Text>
        {isCurrentSlot && (
          <View style={emptyCardStyles.liveIndicator}>
            <Text style={emptyCardStyles.liveText}>LIVE</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Activity card - matching HTML .activity-card with tier colors
  const borderColor = getValueTierBorderColor(timeSlot.activity);
  
  return (
    <TouchableOpacity
      style={[
        activityCardStyles.container,
        { borderLeftColor: borderColor },
        isCurrentSlot && activityCardStyles.current,
        style
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={activityCardStyles.title} numberOfLines={1}>
        {timeSlot.activity.name}
      </Text>
      <Text style={activityCardStyles.value}>
        {formatValue(timeSlot.activity.hourlyValue)}
      </Text>
      {isCurrentSlot && (
        <View style={activityCardStyles.liveIndicator}>
          <Text style={activityCardStyles.liveText}>LIVE</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Empty card styles - matching HTML reference
const emptyCardStyles = {
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // var(--muted)
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed' as const,
    borderRadius: 8, // var(--radius-md)
    padding: 12,
    minHeight: 60,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,
  
  text: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#9E9E9E', // var(--muted-foreground)
  } as ViewStyle,

  current: {
    backgroundColor: '#F0FDF4', // Light green background
    borderColor: '#16A34A', // Green border
    borderWidth: 2,
  } as ViewStyle,

  currentText: {
    color: '#16A34A',
    fontWeight: '600' as const,
  } as ViewStyle,

  liveIndicator: {
    position: 'absolute' as const,
    top: -8,
    right: -8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  } as ViewStyle,

  liveText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  } as ViewStyle,
};

// Activity card styles - matching HTML reference
const activityCardStyles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // var(--card)
    borderWidth: 1,
    borderColor: '#E5E5E5', // var(--border)
    borderLeftWidth: 4, // Tier color border
    borderRadius: 8, // var(--radius-md)
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,
  
  current: {
    backgroundColor: '#F0FDF4', // Light green background
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  } as ViewStyle,
  
  title: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937', // Dark text
    marginBottom: 4,
  } as ViewStyle,
  
  value: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#6B7280', // Gray text
    opacity: 0.8,
  } as ViewStyle,

  liveIndicator: {
    position: 'absolute' as const,
    top: -8,
    right: -8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  } as ViewStyle,

  liveText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  } as ViewStyle,
};