import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Timeline, getActivityValueStyles } from '../../styles/designSystem';
import { TimeSlot as TimeSlotType } from '../../types';
import { TimeLabel } from './TimeLabel';
import { ActivityCard } from './ActivityCard';
import { EmptySlotCard } from './EmptySlotCard';

interface TimeSlotProps {
  timeSlot: TimeSlotType;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  timeSlot,
  onPress,
  isFirst = false,
  isLast = false
}) => {
  const timeLabel = format(timeSlot.startTime, 'h:mm a');
  const hasActivity = !!timeSlot.activity;

  // Get activity styling if there's an activity
  const activityStyles = hasActivity 
    ? getActivityValueStyles(timeSlot.value || 0)
    : null;

  return (
    <View style={[
      styles.container,
      isFirst && styles.firstSlot,
      isLast && styles.lastSlot
    ]}>
      <TimeLabel 
        time={timeLabel}
        isActive={hasActivity}
      />
      
      <TouchableOpacity
        style={[
          styles.cardContainer,
          hasActivity ? styles.filledContainer : styles.emptyContainer
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {hasActivity ? (
          <ActivityCard
            activity={timeSlot.activity}
            value={timeSlot.value || 0}
            styles={activityStyles}
          />
        ) : (
          <EmptySlotCard />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: Timeline.slot.marginBottom,
    minHeight: Timeline.slot.minHeight,
  },
  
  firstSlot: {
    marginTop: Timeline.slot.cardPadding,
  },
  
  lastSlot: {
    marginBottom: Timeline.slot.cardPadding * 2,
  },
  
  cardContainer: {
    flex: 1,
    borderRadius: Timeline.slot.borderRadius,
    padding: Timeline.slot.cardPadding,
    minHeight: Timeline.slot.minHeight,
    justifyContent: 'center' as const,
  },
  
  filledContainer: {
    ...Timeline.card.filled,
  },
  
  emptyContainer: {
    ...Timeline.card.empty,
  }
};