import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { TimeSlot, Activity, DailyLog } from '../types';
import { timeSlotService } from '../services/TimeSlotService';
import { storageService } from '../services/StorageService';
import { activityService } from '../services/ActivityService';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/designSystem';
import { getValueDisplayWithSign } from '../utils/indianNumberFormat';

const DayViewScreen = ({ route, navigation }: any) => {
  const [selectedDate, setSelectedDate] = useState<Date>(
    route.params?.selectedDate ? parseISO(route.params.selectedDate) : new Date()
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDayData();
  }, [selectedDate]);

  const loadDayData = async () => {
    try {
      setLoading(true);
      
      // Generate time slots for the date
      const slots = timeSlotService.generateTimeSlotsForDate(selectedDate);
      
      // Get stored activity logs for this date
      const storedLogs = await storageService.getActivityLogsForDate(selectedDate);
      
      // Match stored logs with time slots
      const populatedSlots = slots.map(slot => {
        const matchingLog = storedLogs.find(log => {
          const logStart = parseISO(log.timeSlotStart);
          return logStart.getTime() === slot.startTime.getTime();
        });
        
        if (matchingLog) {
          const activity = activityService.getActivityById(matchingLog.activityId);
          const blockValue = matchingLog.blockValue || 0;
          return {
            ...slot,
            activity: activity || {
              id: matchingLog.activityId,
              name: matchingLog.activityName,
              hourlyValue: matchingLog.hourlyValue || 0,
              blockValue: blockValue,
              category: 'Unknown',
              searchTags: [],
            },
            value: blockValue,
            isLogged: true,
          };
        }
        
        return slot;
      });
      
      setTimeSlots(populatedSlots);
      
      // Calculate daily log
      const log = timeSlotService.calculateDailyLog(selectedDate, populatedSlots);
      setDailyLog(log);
      
    } catch (error) {
      console.error('Failed to load day data:', error);
      Alert.alert('Error', 'Failed to load day data');
    } finally {
      setLoading(false);
    }
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subDays(selectedDate, 1) 
      : addDays(selectedDate, 1);
    setSelectedDate(newDate);
  };

  const handleTimeSlotPress = (timeSlot: TimeSlot) => {
    navigation.navigate('ActivitySelection', {
      timeSlot,
      onActivitySelected: (activity: Activity) => {
        updateTimeSlot(timeSlot, activity);
      },
    });
  };

  const updateTimeSlot = async (timeSlot: TimeSlot, activity: Activity | null) => {
    try {
      const updatedSlot = timeSlotService.updateTimeSlotActivity(timeSlot, activity);
      
      if (activity) {
        await storageService.saveActivityLog(updatedSlot);
      } else {
        await storageService.deleteActivityLog(timeSlot.id);
      }
      
      // Reload data to reflect changes
      await loadDayData();
    } catch (error) {
      console.error('Failed to update time slot:', error);
      Alert.alert('Error', 'Failed to update activity');
    }
  };

  const renderTimeSlot = ({ item: timeSlot }: { item: TimeSlot }) => {
    const { timeRange, activityName, statusText } = 
      timeSlotService.formatTimeSlotDisplay(timeSlot);
    
    const valueDisplay = getValueDisplayWithSign(timeSlot.value);

    const backgroundColor = timeSlot.activity 
      ? (timeSlot.value >= 10000 ? '#F0FDF4' : 
         timeSlot.value >= 0 ? Colors.cloudWhite : '#FEF2F2')
      : '#F9FAFB';
      
    const borderColor = timeSlot.activity 
      ? (timeSlot.value >= 10000 ? Colors.successGreen :
         timeSlot.value >= 0 ? Colors.primaryBlue : Colors.dangerRed)
      : '#E5E7EB';

    return (
      <TouchableOpacity
        style={[styles.timeSlotCard, { backgroundColor, borderColor }]}
        onPress={() => handleTimeSlotPress(timeSlot)}
      >
        <View style={styles.timeSlotContent}>
          <Text style={styles.timeRange}>{timeRange}</Text>
          <Text style={[styles.activityName, { 
            color: timeSlot.activity ? Colors.primaryBlue : Colors.shadowGray 
          }]}>
            {activityName}
          </Text>
          <View style={styles.valueRow}>
            <Text style={[styles.valueText, { 
              color: valueDisplay.color
            }]}>
              {valueDisplay.text}
            </Text>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.shadowGray} />
      </TouchableOpacity>
    );
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <LinearGradient colors={Colors.cloudGradient} style={styles.container}>
      {/* Date Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateDay('prev')}>
          <Ionicons name="chevron-back" size={24} color={Colors.primaryBlue} />
        </TouchableOpacity>
        
        <Text style={styles.dateText}>
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          {isToday && <Text style={styles.todayIndicator}> (Today)</Text>}
        </Text>
        
        <TouchableOpacity onPress={() => navigateDay('next')}>
          <Ionicons name="chevron-forward" size={24} color={Colors.primaryBlue} />
        </TouchableOpacity>
      </View>

      {/* Daily Total */}
      <View style={styles.dailyTotalCard}>
        <Text style={styles.dailyTotalLabel}>Daily Total</Text>
        <Text style={[styles.dailyTotalValue, { 
          color: getValueDisplayWithSign(dailyLog?.totalValue || 0).color
        }]}>
          {getValueDisplayWithSign(dailyLog?.totalValue || 0).text}
        </Text>
        <Text style={styles.dailyTotalSub}>
          {dailyLog?.completedSlots || 0} of {timeSlots.length} slots filled
        </Text>
      </View>

      {/* Time Slots List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={timeSlots}
          renderItem={renderTimeSlot}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.cloudWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mistGray,
  },
  dateText: {
    ...Typography.headline,
    color: Colors.primaryBlue,
    fontWeight: '600',
  },
  todayIndicator: {
    color: Colors.primaryBlue,
    ...Typography.bodyLarge,
    fontWeight: 'normal',
  },
  dailyTotalCard: {
    backgroundColor: Colors.cloudWhite,
    padding: Spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.mistGray,
    ...Shadows.soft,
  },
  dailyTotalLabel: {
    ...Typography.bodyLarge, // Changed from bodySmall for better hierarchy
    color: Colors.primaryBlue, // Changed from shadowGray for better contrast
    marginBottom: 6, // Increased spacing
    fontWeight: '600', // Added weight for prominence
    fontSize: 16, // Explicit size for labels
  },
  dailyTotalValue: {
    ...Typography.displayLarge,
    fontWeight: 'bold',
    marginBottom: 6, // Increased spacing
  },
  dailyTotalSub: {
    ...Typography.bodyLarge, // Changed from caption for better readability
    color: '#6B7280', // Darker gray for better contrast
    fontSize: 14, // Larger size for better readability
    fontWeight: '500', // Added weight for better visibility
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodyLarge,
    color: Colors.shadowGray,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.xl,
  },
  timeSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.soft,
  },
  timeSlotContent: {
    flex: 1,
  },
  timeRange: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.primaryBlue,
    marginBottom: 4,
  },
  activityName: {
    ...Typography.bodyLarge,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
  },
  statusText: {
    ...Typography.caption,
    color: Colors.shadowGray,
  },
});

export default DayViewScreen;