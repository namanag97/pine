import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { TimeSlot, Activity } from '../types';
import { Colors, Spacing, BorderRadius, Shadows } from '../styles/designSystem';
import { getValueDisplayWithSign } from '../utils/indianNumberFormat';
import { AppText, Stack, Card, Badge } from './ui';

interface CalendarTimelineViewProps {
  timeSlots: TimeSlot[];
  currentTime: Date;
  onTimeSlotPress: (timeSlot: TimeSlot) => void;
  onScrollToNow: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const HOUR_HEIGHT = 60; // Reduced from 80
const TIME_LABEL_WIDTH = 65; // Increased to accommodate AM/PM

const CalendarTimelineView: React.FC<CalendarTimelineViewProps> = ({
  timeSlots,
  currentTime,
  onTimeSlotPress,
  onScrollToNow,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  useEffect(() => {
    // Auto-scroll to current time on mount with delay to ensure rendering
    const timer = setTimeout(() => {
      scrollToCurrentTime();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [timeSlots]); // Re-scroll when timeSlots change

  const scrollToCurrentTime = () => {
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    
    // Calculate scroll position more accurately
    const currentTimeSlotIndex = timeSlots.findIndex(slot => {
      return currentTime >= slot.startTime && currentTime < slot.endTime;
    });
    
    if (currentTimeSlotIndex >= 0 && scrollViewRef.current) {
      // Calculate position based on actual slot arrangement
      const hourOfSlot = timeSlots[currentTimeSlotIndex].startTime.getHours();
      const slotsBeforeThisHour = timeSlots.filter(slot => 
        slot.startTime.getHours() < hourOfSlot
      ).length;
      
      // Rough calculation: each slot takes some space plus header
      const scrollPosition = slotsBeforeThisHour * 65 + Math.floor(hourOfSlot / 6) * 30;
      const paddedPosition = Math.max(0, scrollPosition - 120);
      
      scrollViewRef.current.scrollTo({
        y: paddedPosition,
        animated: true,
      });
    }
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(offsetY > 200);
  };

  const getCurrentTimePosition = () => {
    const hour = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return (hour + minutes / 60) * HOUR_HEIGHT;
  };

  const getTimeSlotVariant = (slot: TimeSlot) => {
    const isCurrentSlot = isTimeSlotCurrent(slot);
    const hasActivity = Boolean(slot.activity);
    const value = slot.value;
    
    if (isCurrentSlot) {
      return 'elevated';
    } else if (hasActivity) {
      if (value >= 10000) {
        return 'elevated';
      } else if (value > 0) {
        return 'outlined';
      } else {
        return 'outlined';
      }
    }
    
    return 'default';
  };
  
  const getTimeSlotStyle = (slot: TimeSlot) => {
    const isCurrentSlot = isTimeSlotCurrent(slot);
    const hasActivity = Boolean(slot.activity);
    const value = slot.value;
    
    const style: any = {};
    
    if (isCurrentSlot) {
      style.borderLeftWidth = 4;
      style.borderLeftColor = Colors.warning[600];
    } else if (hasActivity) {
      if (value >= 10000) {
        style.borderLeftWidth = 4;
        style.borderLeftColor = Colors.success[600];
      } else if (value < 0) {
        style.borderLeftWidth = 4;
        style.borderLeftColor = Colors.error[600];
      }
    }
    
    return style;
  };

  const isTimeSlotCurrent = (slot: TimeSlot) => {
    const now = currentTime;
    return now >= slot.startTime && now < slot.endTime;
  };

  const renderHourHeader = (hour: number) => (
    <View key={`hour-${hour}`} style={styles.hourHeader}>
      <AppText variant="caption" color="secondary" style={{ fontWeight: '600', width: 50 }}>
        {format(new Date().setHours(hour, 0), 'h a')}
      </AppText>
      <View style={styles.hourLine} />
    </View>
  );

  const renderTimeSlot = (slot: TimeSlot, index: number) => {
    const isCurrentSlot = isTimeSlotCurrent(slot);
    const valueDisplay = slot.activity ? getValueDisplayWithSign(slot.value) : null;
    const variant = getTimeSlotVariant(slot);
    const customStyle = getTimeSlotStyle(slot);
    
    return (
      <Card
        key={slot.id}
        variant={variant}
        padding="small"
        style={{
          ...styles.timeSlotContainer,
          ...customStyle
        }}
        onPress={() => onTimeSlotPress(slot)}
        accessibilityLabel={`${format(slot.startTime, 'h:mm a')} ${slot.activity ? slot.activity.name : 'empty slot'}`}
        accessibilityRole="button"
      >
        {isCurrentSlot && (
          <Badge 
            variant="warning" 
            size="small" 
            style={styles.liveIndicator}
          >
            LIVE
          </Badge>
        )}
        
        <Stack direction="horizontal" align="center" spacing="md">
          <AppText variant="caption" color="secondary" style={{ fontWeight: '600', width: 60 }}>
            {format(slot.startTime, 'h:mm a')}
          </AppText>
          
          {slot.activity ? (
            <Stack spacing="xs" style={{ flex: 1 }}>
              <Stack direction="horizontal" justify="space-between" align="center">
                <AppText variant="bodySmall" color="primary" numberOfLines={2} style={{ fontWeight: '600', flex: 1 }}>
                  {getActivityEmoji(slot.activity)} {slot.activity.name}
                </AppText>
                <Ionicons name="cloud-done" size={12} color={Colors.success[600]} />
              </Stack>
              {valueDisplay && (
                <AppText variant="numerical" style={{ color: valueDisplay.color, fontSize: 11 }}>
                  {valueDisplay.text}
                  {slot.value >= 10000 && ' ✨'}
                </AppText>
              )}
            </Stack>
          ) : (
            <Stack direction="horizontal" justify="space-between" align="center" style={{ flex: 1 }}>
              <AppText variant="bodySmall" color="tertiary" style={{ fontStyle: 'italic', flex: 1 }}>
                {isCurrentSlot ? 'What are you doing now?' : 'Tap to log activity'}
              </AppText>
              <Ionicons 
                name="add-circle-outline" 
                size={16} 
                color={Colors.neutral[400]} 
              />
            </Stack>
          )}
        </Stack>
      </Card>
    );
  };

  const getActivityEmoji = (activity: Activity) => {
    const category = activity.category.toLowerCase();
    if (category.includes('exercise') || category.includes('fitness')) return '💪';
    if (category.includes('social') || category.includes('media')) return '📱';
    if (category.includes('work') || category.includes('business')) return '💼';
    if (category.includes('learn') || category.includes('study')) return '📚';
    if (category.includes('creative') || category.includes('art')) return '🎨';
    if (category.includes('family') || category.includes('personal')) return '👥';
    return '⚡';
  };


  const groupedTimeSlots = timeSlots.reduce((acc, slot) => {
    const hour = slot.startTime.getHours();
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(slot);
    return acc;
  }, {} as Record<number, TimeSlot[]>);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.timeline}>
          {Object.keys(groupedTimeSlots)
            .map(Number)
            .sort((a, b) => a - b)
            .map((hour) => (
              <View key={hour} style={styles.hourBlock}>
                {renderHourHeader(hour)}
                {groupedTimeSlots[hour].map((slot, index) => 
                  renderTimeSlot(slot, index)
                )}
              </View>
            ))
          }
        </View>
      </ScrollView>

      {/* Floating scroll to now button */}
      {showScrollToTop && (
        <TouchableOpacity
          style={styles.scrollToNowButton}
          onPress={() => {
            scrollToCurrentTime();
            onScrollToNow();
          }}
          accessibilityLabel="Scroll to current time"
          accessibilityRole="button"
        >
          <Ionicons name="time" size={20} color={Colors.neutral[50]} />
          <AppText variant="caption" style={{ color: Colors.neutral[50], fontWeight: 'bold', marginLeft: 4 }}>
            NOW
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  timeline: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    position: 'relative' as const,
  },
  hourBlock: {
    marginBottom: Spacing.md,
  },
  hourHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing.sm,
    paddingLeft: TIME_LABEL_WIDTH + Spacing.sm,
  },
  hourLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginLeft: Spacing.md,
  },
  timeSlotContainer: {
    marginBottom: Spacing.xs,
    position: 'relative' as const,
  },
  liveIndicator: {
    position: 'absolute' as const,
    top: -8,
    right: 8,
  },
  scrollToNowButton: {
    position: 'absolute' as const,
    bottom: 100,
    right: 20,
    backgroundColor: Colors.primary[500],
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    ...Shadows.medium,
  },
};

export default CalendarTimelineView;