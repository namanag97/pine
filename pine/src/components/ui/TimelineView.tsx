import React, { memo, useEffect, useRef } from 'react';
import { ScrollView, ViewStyle, View, Text } from 'react-native';
import { format } from 'date-fns';
import { TimeSlot } from '../../types';
import { TimeSlotCard } from './TimeSlotCard';

export interface TimelineViewProps {
  timeSlots: TimeSlot[];
  onTimeSlotPress: (timeSlot: TimeSlot) => void;
  currentTimeSlot?: TimeSlot;
  style?: ViewStyle;
}

export const TimelineView: React.FC<TimelineViewProps> = memo(({
  timeSlots,
  onTimeSlotPress,
  currentTimeSlot,
  style,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to current time slot when component mounts or currentTimeSlot changes
  useEffect(() => {
    if (currentTimeSlot && scrollViewRef.current && timeSlots.length > 0) {
      const currentIndex = timeSlots.findIndex(slot => slot.id === currentTimeSlot.id);
      if (currentIndex >= 0) {
        // Calculate scroll position (each time slot is approximately 68px high)
        const slotHeight = 68;
        const scrollPosition = currentIndex * slotHeight;
        
        // Scroll with a small delay to ensure the component has rendered
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, scrollPosition - 100), // Offset to show some context
            animated: true,
          });
        }, 300);
      }
    }
  }, [currentTimeSlot, timeSlots]);
  
  const renderTimeSlot = (timeSlot: TimeSlot) => {
    const isCurrentSlot = currentTimeSlot?.id === timeSlot.id;
    
    return (
      <View key={timeSlot.id} style={timelineStyles.timeSlot}>
        {/* Time Label - matching HTML .time-label */}
        <View style={timelineStyles.timeLabel}>
          <Text style={timelineStyles.timeText}>
            {format(timeSlot.startTime, 'h:mm a').toUpperCase()}
          </Text>
        </View>
        
        {/* Activity Card - matching HTML .activity-card container */}
        <TimeSlotCard
          timeSlot={timeSlot}
          onPress={() => onTimeSlotPress(timeSlot)}
          isCurrentSlot={isCurrentSlot}
        />
      </View>
    );
  };

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={[timelineStyles.container, style]}
      contentContainerStyle={timelineStyles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {timeSlots.map(renderTimeSlot)}
    </ScrollView>
  );
});

TimelineView.displayName = 'TimelineView';

// Exact match to HTML timeline structure
const timelineStyles = {
  container: {
    flex: 1,
  } as ViewStyle,
  
  // Timeline container padding matching HTML .timeline-container
  contentContainer: {
    paddingHorizontal: 20, // padding: 0 20px 100px 20px
    paddingBottom: 100, // Space for CurrentActivityBar
  } as ViewStyle,
  
  // Time slot row matching HTML .time-slot
  timeSlot: {
    flexDirection: 'row' as const, // display: flex
    alignItems: 'center' as const, // align-items: center
    marginBottom: 8, // margin-bottom: 8px
    minHeight: 60, // min-height: 60px
  } as ViewStyle,
  
  // Time label matching HTML .time-label
  timeLabel: {
    width: 70, // width: 70px
    alignItems: 'flex-end' as const, // text-align: right
    marginRight: 12, // margin-right: 12px
  } as ViewStyle,
  
  // Time text styling matching HTML reference
  timeText: {
    fontSize: 12, // font-size: 12px
    fontWeight: '500' as const, // font-weight: 500
    color: '#6B7280', // var(--muted-foreground)
    textAlign: 'right' as const,
  } as ViewStyle,
};