import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DailyLog, TimeSlot, Activity } from '../types';
import { storageService } from '../services/StorageService';
import { timeSlotService } from '../services/TimeSlotService';
import { activityService } from '../services/ActivityService';
import { 
  Timeline,
  SemanticColors, 
  Colors,
  calculateDashboardMetrics
} from '../styles/designSystem';
import { calculateAnnualProjection } from '../utils/indianNumberFormat';
import { AppText } from '../components/ui';
import {
  TimelineContainer,
  StatsHeader,
  CurrentActivityStatus
} from '../components/dashboard';

// Type-safe navigation props
type RootStackParamList = {
  Dashboard: undefined;
  ActivitySelection: {
    timeSlot: TimeSlot;
    onActivitySelected: (activity: Activity | null) => void;
  };
  Settings: undefined;
  Stats: undefined;
};

type DashboardScreenProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  // Simplified state management - only 3 core state variables
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Computed values using useMemo - replaces multiple useState hooks
  const dashboardData = useMemo(() => {
    const todayLog = timeSlotService.calculateDailyLog(selectedDate, timeSlots);
    const currentTimeSlot = timeSlotService.getCurrentTimeSlot(timeSlots);
    const currentActivity = currentTimeSlot || 
                           timeSlots.filter(s => s.activity).pop() || null;
    const annualProjection = calculateAnnualProjection(todayLog.totalValue);
    const metrics = calculateDashboardMetrics(timeSlots);
    
    return {
      todayLog,
      currentTimeSlot,
      currentActivity,
      annualProjection,
      metrics
    };
  }, [selectedDate, timeSlots]);

  // Simplified data loading method
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Generate time slots for selected date
      const generatedTimeSlots = timeSlotService.generateTimeSlotsForDate(selectedDate);
      
      // Get stored activity logs and populate time slots
      const storedLogs = await storageService.getActivityLogsForDate(selectedDate);
      const populatedTimeSlots = generatedTimeSlots.map(slot => {
        const log = storedLogs.find(l => l.id === slot.id);
        if (log) {
          const activity = activityService.getActivityById(log.activityId);
          return timeSlotService.updateTimeSlotActivity(slot, activity);
        }
        return slot;
      });
      
      // Update time slots state - all other values computed via useMemo
      setTimeSlots(populatedTimeSlots);
      
    } catch (error) {
      // Failed to load dashboard data
      Alert.alert(
        'Load Failed', 
        'Unable to load dashboard data. Please try refreshing.', 
        [
          { text: 'OK' },
          { text: 'Retry', onPress: () => loadDashboardData() }
        ]
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Simplified activity selection handler
  const handleActivitySelected = useCallback(async (timeSlot: TimeSlot, activity: Activity | null) => {
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
      
      // Update time slots state - computed values will update automatically via useMemo
      setTimeSlots(prevSlots => 
        prevSlots.map(slot => 
          slot.id === timeSlot.id ? updatedTimeSlot : slot
        )
      );
      
    } catch (error) {
      // Failed to handle activity selection
      Alert.alert('Error', 'Failed to save activity');
    }
  }, []);

  const handleTimeSlotPress = useCallback((timeSlot: TimeSlot) => {
    navigation.navigate('ActivitySelection', {
      timeSlot,
      onActivitySelected: (activity: Activity | null) => {
        handleActivitySelected(timeSlot, activity);
      }
    });
  }, [navigation, handleActivitySelected]);

  const handleStopCurrentActivity = useCallback(() => {
    if (dashboardData.currentActivity) {
      handleActivitySelected(dashboardData.currentActivity, null);
    }
  }, [dashboardData.currentActivity, handleActivitySelected]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={SemanticColors.surface.primary} />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <AppText variant="bodyRegular" color="secondary" style={styles.loadingText}>
              ✨ Loading your income prediction...
            </AppText>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.mobileContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header - Matching HTML Reference */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => {/* Menu functionality not implemented */}} style={styles.menuButton}>
            <Ionicons name="menu" size={20} color="#9E9E9E" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <AppText style={styles.pineTitle}>Pine</AppText>
            <AppText style={styles.todaySubtitle}>Today</AppText>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('Stats')} style={styles.actionButton}>
            <Ionicons name="bar-chart-outline" size={20} color="#9E9E9E" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.actionButton}>
            <Ionicons name="settings-outline" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Card - Exact Match to HTML */}
      <StatsHeader
        todayProjection={dashboardData.todayLog.totalValue}
        annualProjection={dashboardData.annualProjection}
        avgHourlyValue={dashboardData.metrics.avgHourlyValue}
        efficiency={dashboardData.metrics.efficiency}
      />

      {/* Timeline - Matching HTML Structure */}
      <TimelineContainer
        timeSlots={timeSlots}
        onTimeSlotPress={handleTimeSlotPress}
        currentTimeSlot={dashboardData.currentTimeSlot}
        maxSlots={48}
      />

      {/* Current Activity Status */}
      <CurrentActivityStatus
        currentActivity={dashboardData.currentActivity}
        onStopActivity={handleStopCurrentActivity}
      />
    </SafeAreaView>
  );
};

// iPhone 14 Plus optimized styles matching HTML reference exactly
const styles = {
  // Mobile container - iPhone 14 Plus (375px equivalent)
  mobileContainer: {
    flex: 1,
    maxWidth: 428, // iPhone 14 Plus actual width
    alignSelf: 'center' as const,
    backgroundColor: '#FAFAFA', // var(--background)
    width: '100%',
  },
  
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  loadingContent: {
    alignItems: 'center' as const,
  },
  loadingText: {
    textAlign: 'center' as const,
  },
  
  // Header - exact match to HTML reference
  header: {
    backgroundColor: '#FFFFFF', // var(--card)
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5', // var(--border)
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    position: 'sticky' as const,
    zIndex: 50,
  },
  
  headerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  
  headerTitle: {
    marginLeft: 12,
  },
  
  pineTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#16A34A', // text-green-700 
    marginBottom: 2,
  },
  
  todaySubtitle: {
    fontSize: 12,
    color: '#6B7280', // text-gray-500
    fontWeight: '400' as const,
  },
  
  headerRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
};

export default DashboardScreen;