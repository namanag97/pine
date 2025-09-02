// Pine App - Modern Dashboard Screen
// Completely redesigned with modern design system and consolidated components

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StatusBar, ScrollView, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { DailyLog, TimeSlot, Activity } from '../types';
import { storageService } from '../services/StorageService';
import { timeSlotService } from '../services/TimeSlotService';
import { activityService } from '../services/ActivityService';
import { calculateAnnualProjection } from '../utils/indianNumberFormat';

// Modern UI Components
import {
  Display,
  Heading,
  Body,
  Caption,
  Button,
  Card,
  Container,
  Stack,
  TimeSlotCard,
  StatsCard,
  GradientHeader,
  CurrencyText,
  SemanticColors,
  ModernSpacing
} from '../components/ModernUI';

// Types
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

const ModernDashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  // State management - simplified and focused
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Computed dashboard metrics
  const dashboardData = useMemo(() => {
    const todayLog = timeSlotService.calculateDailyLog(selectedDate, timeSlots);
    const currentTimeSlot = timeSlotService.getCurrentTimeSlot(timeSlots);
    const currentActivity = currentTimeSlot || timeSlots.filter(s => s.activity).pop() || null;
    const annualProjection = calculateAnnualProjection(todayLog.totalValue);
    
    // Enhanced metrics
    const filledSlots = timeSlots.filter(s => s.activity).length;
    const highValueSlots = timeSlots.filter(s => s.value >= 20000).length; // High value tier
    const efficiency = timeSlots.length > 0 ? Math.round((filledSlots / timeSlots.length) * 100) : 0;
    const avgHourlyValue = filledSlots > 0 ? Math.round(todayLog.totalValue / (filledSlots * 0.5)) : 0;
    const highValuePercentage = filledSlots > 0 ? Math.round((highValueSlots / filledSlots) * 100) : 0;
    
    return {
      todayLog,
      currentTimeSlot,
      currentActivity,
      annualProjection,
      metrics: {
        filledSlots,
        totalSlots: timeSlots.length,
        highValueSlots,
        efficiency,
        avgHourlyValue,
        highValuePercentage
      }
    };
  }, [selectedDate, timeSlots]);

  // Data loading
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
      
      setTimeSlots(populatedTimeSlots);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  // Activity selection handler
  const handleActivitySelected = useCallback(async (timeSlot: TimeSlot, activity: Activity | null) => {
    try {
      let updatedTimeSlot: TimeSlot;
      
      if (activity) {
        updatedTimeSlot = timeSlotService.updateTimeSlotActivity(timeSlot, activity);
        await storageService.saveActivityLog(updatedTimeSlot);
      } else {
        await storageService.deleteActivityLog(timeSlot.id);
        updatedTimeSlot = { ...timeSlot, activity: undefined, value: 0 };
      }
      
      // Update state
      setTimeSlots(prevSlots => 
        prevSlots.map(slot => 
          slot.id === timeSlot.id ? updatedTimeSlot : slot
        )
      );
    } catch (error) {
      console.error('Failed to handle activity selection:', error);
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

  // Effects
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: SemanticColors.background.primary }}>
        <StatusBar barStyle="dark-content" backgroundColor={SemanticColors.background.primary} />
        <Container style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Stack align="center" spacing="4">
            <Display size="medium">✨</Display>
            <Body size="large" color="secondary" align="center">
              Loading your productivity insights...
            </Body>
          </Stack>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SemanticColors.background.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={SemanticColors.background.primary} />
      
      {/* Modern Header with Gradient */}
      <GradientHeader>
        <Stack direction="row" align="center" justify="space-between">
          {/* Left side - App branding */}
          <Stack direction="row" align="center" spacing="3">
            <Button
              variant="ghost"
              icon="menu"
              onPress={() => {/* Menu functionality */}}
            />
            <Stack spacing="0.5">
              <Heading level={4} style={{ color: SemanticColors.text.inverse }}>
                Pine
              </Heading>
              <Caption style={{ color: SemanticColors.text.inverse }}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </Caption>
            </Stack>
          </Stack>

          {/* Right side - Actions */}
          <Stack direction="row" spacing="2">
            <Button
              variant="ghost"
              icon="bar-chart-outline"
              onPress={() => navigation.navigate('Stats')}
            />
            <Button
              variant="ghost"
              icon="settings-outline"
              onPress={() => navigation.navigate('Settings')}
            />
          </Stack>
        </Stack>
      </GradientHeader>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: ModernSpacing['20'] }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Modern Stats Overview */}
        <Container>
          <Stack spacing="6">
            {/* Daily Summary Cards */}
            <Stack spacing="4">
              <Heading level={5} color="primary">Today's Performance</Heading>
              
              <Stack direction="row" spacing="4">
                <View style={{ flex: 1 }}>
                  <StatsCard
                    title="Today's Value"
                    value={dashboardData.todayLog.totalValue}
                    subtitle={`${dashboardData.metrics.filledSlots}/${dashboardData.metrics.totalSlots} slots filled`}
                    trend="up"
                    icon="today-outline"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <StatsCard
                    title="Efficiency"
                    value={`${dashboardData.metrics.efficiency}%`}
                    subtitle={`${dashboardData.metrics.highValuePercentage}% high-value`}
                    trend={dashboardData.metrics.efficiency > 70 ? 'up' : 'neutral'}
                    icon="trending-up-outline"
                  />
                </View>
              </Stack>

              {/* Annual Projection - Premium Card */}
              <StatsCard
                title="Annual Projection"
                value={dashboardData.annualProjection}
                subtitle="Based on current performance"
                icon="calendar-outline"
                variant="premium"
              />
            </Stack>

            {/* Current Activity Status */}
            {dashboardData.currentActivity && (
              <Card variant="elevated">
                <Stack spacing="4">
                  <Stack direction="row" align="center" justify="space-between">
                    <Heading level={6} color="primary">Current Activity</Heading>
                    <Button
                      variant="secondary"
                      size="small"
                      onPress={handleStopCurrentActivity}
                    >
                      Stop
                    </Button>
                  </Stack>
                  
                  <Stack direction="row" align="center" spacing="4">
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: SemanticColors.text.success
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Body size="medium" color="primary">
                        {dashboardData.currentActivity.activity?.name || 'No activity'}
                      </Body>
                      <Caption color="secondary">
                        Started at {dashboardData.currentActivity.startTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Caption>
                    </View>
                    <CurrencyText 
                      value={dashboardData.currentActivity.value} 
                      size="medium" 
                    />
                  </Stack>
                </Stack>
              </Card>
            )}

            {/* Time Slots Timeline */}
            <Stack spacing="4">
              <Heading level={5} color="primary">Today's Timeline</Heading>
              
              <Stack spacing="2">
                {timeSlots.map((timeSlot, index) => (
                  <TimeSlotCard
                    key={timeSlot.id}
                    timeSlot={timeSlot}
                    onPress={handleTimeSlotPress}
                    isCurrentSlot={timeSlot.id === dashboardData.currentTimeSlot?.id}
                  />
                ))}
              </Stack>
            </Stack>

            {/* Quick Actions */}
            <Stack spacing="4">
              <Heading level={6} color="secondary">Quick Actions</Heading>
              <Stack direction="row" spacing="3">
                <View style={{ flex: 1 }}>
                  <Button
                    variant="secondary"
                    fullWidth
                    icon="add-circle-outline"
                    onPress={() => {
                      const emptySlot = timeSlots.find(s => !s.activity);
                      if (emptySlot) handleTimeSlotPress(emptySlot);
                    }}
                  >
                    Add Activity
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    variant="ghost"
                    fullWidth
                    icon="analytics-outline"
                    onPress={() => navigation.navigate('Stats')}
                  >
                    View Stats
                  </Button>
                </View>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ModernDashboardScreen;