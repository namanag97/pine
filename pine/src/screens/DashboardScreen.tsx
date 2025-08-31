import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, RefreshControl, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, addDays, subDays, isToday } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { DailyLog, TimeSlot, Activity } from '../types';
import { storageService } from '../services/StorageService';
import { timeSlotService } from '../services/TimeSlotService';
import { activityService } from '../services/ActivityService';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/designSystem';
import { calculateAnnualProjection, getIncomeCalculationExplanation } from '../utils/indianNumberFormat';
import CalendarTimelineView from '../components/CalendarTimelineView';
import IncomeProjectionHeader from '../components/IncomeProjectionHeader';

const DashboardScreen = ({ navigation }: any) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [todayTimeSlots, setTodayTimeSlots] = useState<TimeSlot[]>([]);
  const [currentActivity, setCurrentActivity] = useState<TimeSlot | null>(null);
  const [annualProjection, setAnnualProjection] = useState<string>('₹0');
  const [highValuePercentage, setHighValuePercentage] = useState<number>(0);
  const [progressStats, setProgressStats] = useState<{totalSlots: number, filledSlots: number, zeroValueSlots: number}>({
    totalSlots: 0,
    filledSlots: 0,
    zeroValueSlots: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = selectedDate;
      
      // Generate time slots for today
      const timeSlots = timeSlotService.generateTimeSlotsForDate(today);
      
      // Get stored activity logs for today and populate time slots
      const storedLogs = await storageService.getActivityLogsForDate(today);
      const populatedTimeSlots = timeSlots.map(slot => {
        const log = storedLogs.find(l => l.id === slot.id);
        if (log) {
          const activity = activityService.getActivityById(log.activityId);
          return timeSlotService.updateTimeSlotActivity(slot, activity);
        }
        return slot;
      });
      
      setTodayTimeSlots(populatedTimeSlots);
      
      // Create today's log
      const dailyLog = timeSlotService.calculateDailyLog(today, populatedTimeSlots);
      setTodayLog(dailyLog);
      
      // Calculate annual projection
      const projection = calculateAnnualProjection(dailyLog.totalValue);
      setAnnualProjection(projection);
      
      // Find current/recent activity
      const now = new Date();
      const current = timeSlotService.getCurrentTimeSlot(populatedTimeSlots) || 
                     populatedTimeSlots.filter(s => s.activity).pop() || null;
      setCurrentActivity(current);
      
      // Calculate high-value percentage and progress stats
      const filledSlots = populatedTimeSlots.filter(s => s.activity).length;
      const highValueSlots = populatedTimeSlots.filter(s => s.value >= 10000).length;
      const zeroValueSlots = populatedTimeSlots.filter(s => s.activity && s.value === 0).length;
      
      setHighValuePercentage(filledSlots > 0 ? Math.round((highValueSlots / filledSlots) * 100) : 0);
      
      // Store additional progress stats for header
      setProgressStats({
        totalSlots: populatedTimeSlots.length,
        filledSlots,
        zeroValueSlots
      });
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Removed navigateToCurrentDay since we no longer use DayView

  const openQuickAction = () => {
    const currentSlot = timeSlotService.getCurrentTimeSlot(todayTimeSlots) || 
                       timeSlotService.generateTimeSlotsForDate(new Date())[0];
    
    navigation.navigate('ActivitySelection', {
      timeSlot: currentSlot,
      onActivitySelected: (activity: Activity | null) => {
        handleActivitySelected(currentSlot, activity);
      }
    });
  };

  const handleActivitySelected = async (timeSlot: TimeSlot, activity: Activity | null) => {
    try {
      let updatedTimeSlot: TimeSlot;
      
      if (activity) {
        // Update the time slot with the selected activity
        updatedTimeSlot = timeSlotService.updateTimeSlotActivity(timeSlot, activity);
        await storageService.saveActivityLog(updatedTimeSlot);
      } else {
        // Remove activity from time slot
        await storageService.deleteActivityLog(timeSlot.id);
        updatedTimeSlot = { ...timeSlot, activity: undefined, value: 0 };
      }
      
      // Update the time slots state directly without full reload
      setTodayTimeSlots(prevSlots => 
        prevSlots.map(slot => 
          slot.id === timeSlot.id ? updatedTimeSlot : slot
        )
      );
      
      // Recalculate stats based on updated slots
      const updatedSlots = todayTimeSlots.map(slot => 
        slot.id === timeSlot.id ? updatedTimeSlot : slot
      );
      
      // Update derived state
      const dailyLog = timeSlotService.calculateDailyLog(selectedDate, updatedSlots);
      setTodayLog(dailyLog);
      
      const projection = calculateAnnualProjection(dailyLog.totalValue);
      setAnnualProjection(projection);
      
      const filledSlots = updatedSlots.filter(s => s.activity).length;
      const highValueSlots = updatedSlots.filter(s => s.value >= 10000).length;
      const zeroValueSlots = updatedSlots.filter(s => s.activity && s.value === 0).length;
      
      setHighValuePercentage(filledSlots > 0 ? Math.round((highValueSlots / filledSlots) * 100) : 0);
      setProgressStats({
        totalSlots: updatedSlots.length,
        filledSlots,
        zeroValueSlots
      });
      
    } catch (error) {
      console.error('Failed to handle activity selection:', error);
      Alert.alert('Error', 'Failed to save activity');
    }
  };

  const showIncomeExplanation = () => {
    Alert.alert(
      'How Income is Calculated',
      getIncomeCalculationExplanation(),
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const handleTimeSlotPress = (timeSlot: TimeSlot) => {
    navigation.navigate('ActivitySelection', {
      timeSlot,
      onActivitySelected: (activity: Activity | null) => {
        handleActivitySelected(timeSlot, activity);
      }
    });
  };

  const handleScrollToNow = () => {
    // Optional: Add any analytics or feedback for scroll to now action
  };

  const navigateToDate = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const goToPreviousDay = () => {
    navigateToDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    navigateToDate(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    navigateToDate(new Date());
  };

  if (loading) {
    return (
      <LinearGradient colors={Colors.skyGradient} style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <Text style={styles.loadingText}>✨ Loading your income prediction...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Colors.skyGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Date Navigation */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity onPress={goToPreviousDay} style={styles.navArrow}>
            <Ionicons name="chevron-back" size={20} color={Colors.primaryBlue} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToToday} style={styles.dateButton}>
            <Text style={styles.dateText}>
              {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
            </Text>
            <Text style={styles.dayText}>{format(selectedDate, 'EEEE')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={goToNextDay} style={styles.navArrow}>
            <Ionicons name="chevron-forward" size={20} color={Colors.primaryBlue} />
          </TouchableOpacity>
        </View>

        {/* Income Projection Header */}
        <IncomeProjectionHeader
          annualProjection={annualProjection}
          todayValue={todayLog?.totalValue || 0}
          todayActivityCount={todayLog?.activityCount || 0}
          highValuePercentage={highValuePercentage}
          totalSlots={progressStats.totalSlots}
          filledSlots={progressStats.filledSlots}
          zeroValueSlots={progressStats.zeroValueSlots}
          onInfoPress={showIncomeExplanation}
        />

        {/* Calendar Timeline View */}
        <CalendarTimelineView
          timeSlots={todayTimeSlots}
          currentTime={new Date()}
          onTimeSlotPress={handleTimeSlotPress}
          onScrollToNow={handleScrollToNow}
        />

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={openQuickAction}>
          <Ionicons name="add" size={28} color={Colors.cloudWhite} />
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.primaryBlue} />
            <Text style={styles.navButtonText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigation.navigate('ActivityLog')}
          >
            <Ionicons name="list-outline" size={22} color={Colors.primaryBlue} />
            <Text style={styles.navButtonText}>History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => navigation.navigate('Stats')}
          >
            <Ionicons name="analytics-outline" size={22} color={Colors.primaryBlue} />
            <Text style={styles.navButtonText}>Stats</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodyLarge,
    color: Colors.shadowGray,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
    elevation: 8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.cloudWhite + 'F0',
    borderTopWidth: 1,
    borderTopColor: Colors.mistGray,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  navButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  navButtonText: {
    ...Typography.caption,
    color: Colors.primaryBlue,
    fontWeight: '500',
    marginTop: 4,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cloudWhite + '20',
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
    marginTop: Spacing.sm,
  },
  navArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cloudWhite,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  dateButton: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  dateText: {
    ...Typography.bodyLarge,
    color: Colors.primaryBlue,
    fontWeight: 'bold',
  },
  dayText: {
    ...Typography.caption,
    color: Colors.shadowGray,
    marginTop: 2,
  },
});

export default DashboardScreen;