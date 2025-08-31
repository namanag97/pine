import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { TimeSlot, Activity } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/designSystem';
import { getValueDisplayWithSign } from '../utils/indianNumberFormat';

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

  const getTimeSlotStyle = (slot: TimeSlot) => {
    const isCurrentSlot = isTimeSlotCurrent(slot);
    const hasActivity = Boolean(slot.activity);
    const value = slot.value;
    
    let backgroundColor = Colors.mistGray;
    let borderColor = 'transparent';
    let borderWidth = 1;
    
    if (isCurrentSlot) {
      backgroundColor = Colors.premiumGold + '20';
      borderColor = Colors.premiumGold;
      borderWidth = 2;
    } else if (hasActivity) {
      if (value >= 100000) {
        backgroundColor = Colors.successGreen + '15';
        borderColor = Colors.successGreen;
      } else if (value >= 10000) {
        backgroundColor = Colors.primaryBlue + '10';
        borderColor = Colors.primaryBlue;
      } else if (value > 0) {
        backgroundColor = Colors.cloudWhite;
        borderColor = Colors.shadowGray;
      } else {
        backgroundColor = '#FF6B6B20';
        borderColor = '#FF6B6B';
      }
    }
    
    return {
      backgroundColor,
      borderColor,
      borderWidth,
    };
  };

  const isTimeSlotCurrent = (slot: TimeSlot) => {
    const now = currentTime;
    return now >= slot.startTime && now < slot.endTime;
  };

  const renderHourHeader = (hour: number) => (
    <View key={`hour-${hour}`} style={styles.hourHeader}>
      <Text style={styles.hourText}>
        {format(new Date().setHours(hour, 0), 'h a')}
      </Text>
      <View style={styles.hourLine} />
    </View>
  );

  const renderTimeSlot = (slot: TimeSlot, index: number) => {
    const isCurrentSlot = isTimeSlotCurrent(slot);
    const valueDisplay = slot.activity ? getValueDisplayWithSign(slot.value) : null;
    const slotStyle = getTimeSlotStyle(slot);
    
    return (
      <TouchableOpacity
        key={slot.id}
        style={[styles.timeSlotContainer, slotStyle]}
        onPress={() => onTimeSlotPress(slot)}
        activeOpacity={0.7}
      >
        {isCurrentSlot && (
          <View style={styles.liveIndicator}>
            <Text style={styles.liveText}>LIVE</Text>
            <View style={styles.livePulse} />
          </View>
        )}
        
        <View style={styles.timeSlotContent}>
          <Text style={styles.timeSlotTime}>
            {format(slot.startTime, 'h:mm a')}
          </Text>
          
          {slot.activity ? (
            <View style={styles.activityContent}>
              <View style={styles.activityRow}>
                <Text style={styles.activityName} numberOfLines={2}>
                  {getActivityEmoji(slot.activity)} {slot.activity.name}
                </Text>
                <View style={styles.syncIndicator}>
                  <Ionicons name="cloud-done" size={12} color={Colors.successGreen} />
                </View>
              </View>
              {valueDisplay && (
                <Text style={[styles.activityValue, { color: valueDisplay.color }]}>
                  {valueDisplay.text}
                </Text>
              )}
              {slot.value >= 10000 && <Text style={styles.sparkle}>✨</Text>}
            </View>
          ) : (
            <View style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>
                {isCurrentSlot ? 'What are you doing now?' : 'Tap to log activity'}
              </Text>
              <Ionicons 
                name="add-circle-outline" 
                size={16} 
                color={Colors.shadowGray} 
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
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
        >
          <Ionicons name="time" size={20} color={Colors.cloudWhite} />
          <Text style={styles.scrollToNowText}>NOW</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.skyBlue + '10',
  },
  scrollView: {
    flex: 1,
  },
  timeline: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    position: 'relative',
  },
  hourBlock: {
    marginBottom: Spacing.md, // Reduced from lg
  },
  hourHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm, // Reduced from md
    paddingLeft: TIME_LABEL_WIDTH + Spacing.sm, // Adjusted
  },
  hourText: {
    ...Typography.bodySmall,
    color: Colors.shadowGray,
    fontWeight: '600',
    width: 50,
  },
  hourLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.mistGray,
    marginLeft: Spacing.md,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xs, // Reduced from sm
    borderRadius: BorderRadius.small, // Reduced from medium
    padding: Spacing.sm, // Reduced from md
    ...Shadows.soft,
    position: 'relative',
  },
  liveIndicator: {
    position: 'absolute',
    top: -8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.premiumGold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    ...Shadows.medium,
  },
  liveText: {
    ...Typography.caption,
    color: Colors.cloudWhite,
    fontWeight: 'bold',
    fontSize: 10,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.cloudWhite,
    marginLeft: 4,
  },
  timeSlotContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotTime: {
    ...Typography.caption, // Reduced from bodySmall
    color: Colors.shadowGray,
    width: TIME_LABEL_WIDTH,
    fontWeight: '600',
    fontSize: 11, // Reduced from 12
  },
  activityContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  activityName: {
    ...Typography.bodySmall, // Reduced from bodyLarge
    color: Colors.primaryBlue,
    fontWeight: '600',
    lineHeight: 16, // Reduced from 20
    fontSize: 13, // Explicit smaller size
    flex: 1,
  },
  syncIndicator: {
    marginLeft: Spacing.xs,
    paddingTop: 2,
  },
  activityValue: {
    ...Typography.caption, // Reduced from bodySmall
    fontWeight: '600',
    marginTop: 1, // Reduced from 2
    fontSize: 11,
  },
  sparkle: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: 16,
  },
  emptySlot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: Spacing.md,
  },
  emptySlotText: {
    ...Typography.bodySmall,
    color: Colors.shadowGray,
    fontStyle: 'italic',
    flex: 1,
  },
  scrollToNowButton: {
    position: 'absolute',
    bottom: 100, // Changed from 20 to avoid bottom navigation
    right: 20,
    backgroundColor: Colors.primaryBlue,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    ...Shadows.medium,
  },
  scrollToNowText: {
    ...Typography.caption,
    color: Colors.cloudWhite,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default CalendarTimelineView;