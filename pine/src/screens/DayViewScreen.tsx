import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { TimeSlot, Activity, DailyLog } from '../types';
import { timeSlotService } from '../services/TimeSlotService';
import { storageService } from '../services/StorageService';
import { activityService } from '../services/ActivityService';
import { Gradients, Colors, Spacing } from '../styles/designSystem';
import { getValueDisplayWithSign } from '../utils/indianNumberFormat';
import { 
  Container, 
  Stack, 
  AppText, 
  Card, 
  StatCard,
  SafeAreaContainer
} from '../components/ui';

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
      // Handle day data loading failure - show user-friendly error
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
      // Handle time slot update failure - show user-friendly error
      Alert.alert('Error', 'Failed to update activity');
    }
  };

  const renderTimeSlot = ({ item: timeSlot }: { item: TimeSlot }) => {
    const { timeRange, activityName, statusText } = 
      timeSlotService.formatTimeSlotDisplay(timeSlot);
    
    const valueDisplay = getValueDisplayWithSign(timeSlot.value);
    const isHighValue = timeSlot.value >= 10000;
    const hasActivity = !!timeSlot.activity;
    const isNegativeValue = timeSlot.value < 0;

    return (
      <Container padding="md">
        <Card 
          variant={hasActivity ? "elevated" : "outlined"} 
          padding="medium" 
          onPress={() => handleTimeSlotPress(timeSlot)}
          style={{
            ...(isHighValue && { borderLeftWidth: 4, borderLeftColor: Colors.success[600] }),
            ...(isNegativeValue && hasActivity && { borderLeftWidth: 4, borderLeftColor: Colors.error[600] })
          }}
          accessibilityLabel={`${timeRange} ${hasActivity ? activityName : 'No activity'} ${valueDisplay.text}`}
          accessibilityRole="button"
        >
          <Stack direction="horizontal" justify="space-between" align="center">
            <Stack spacing="xs" style={{ flex: 1 }}>
              <AppText variant="bodyLarge" color="primary" style={{ fontWeight: '600' }}>
                {timeRange}
              </AppText>
              
              <AppText 
                variant="bodyRegular" 
                color={hasActivity ? "primary" : "tertiary"}
                style={{ fontWeight: hasActivity ? '500' : 'normal' }}
              >
                {activityName}
              </AppText>
              
              <Stack direction="horizontal" justify="space-between" align="center">
                <AppText variant="numerical" style={{ color: valueDisplay.color }}>
                  {valueDisplay.text}
                  {isHighValue && ' ✨'}
                </AppText>
                <AppText variant="caption" color="tertiary">
                  {statusText}
                </AppText>
              </Stack>
            </Stack>
            
            <View style={{ marginLeft: Spacing.sm }}>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
            </View>
          </Stack>
        </Card>
      </Container>
    );
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <LinearGradient colors={Gradients.cloudGradient} style={styles.container}>
      <SafeAreaContainer>
        {/* Header with Back Button */}
        <Container padding="lg">
          <Stack direction="horizontal" align="center" justify="space-between">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
            <AppText variant="heading2" color="primary" align="center">
              📅 Day View
            </AppText>
            <View style={styles.placeholder} />
          </Stack>
        </Container>

        {/* Date Navigation */}
        <Container padding="lg">
          <Card variant="outlined" padding="medium">
            <Stack direction="horizontal" align="center" justify="space-between">
              <TouchableOpacity 
                onPress={() => navigateDay('prev')}
                accessibilityLabel="Previous day"
                accessibilityRole="button"
              >
                <Ionicons name="chevron-back" size={24} color={Colors.primary[500]} />
              </TouchableOpacity>
              
              <Stack align="center">
                <AppText variant="heading3" color="primary" align="center">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </AppText>
                <AppText variant="bodySmall" color="secondary" align="center">
                  {format(selectedDate, 'yyyy')}
                  {isToday && ' • Today'}
                </AppText>
              </Stack>
              
              <TouchableOpacity 
                onPress={() => navigateDay('next')}
                accessibilityLabel="Next day"
                accessibilityRole="button"
              >
                <Ionicons name="chevron-forward" size={24} color={Colors.primary[500]} />
              </TouchableOpacity>
            </Stack>
          </Card>
        </Container>

        {/* Daily Summary */}
        <Container padding="lg">
          <StatCard
            title="📊 Daily Summary"
            value={getValueDisplayWithSign(dailyLog?.totalValue || 0).text}
            subtitle={`${dailyLog?.completedSlots || 0} of ${timeSlots.length} slots completed`}
            icon="trending-up"
            color={getValueDisplayWithSign(dailyLog?.totalValue || 0).color}
          />
        </Container>

        {/* Time Slots List */}
        {loading ? (
          <Container padding="xl">
            <Stack align="center" spacing="md">
              <ActivityIndicator size="large" color={Colors.primary[500]} />
              <AppText variant="bodyLarge" color="secondary" align="center">
                Loading time slots...
              </AppText>
            </Stack>
          </Container>
        ) : (
          <FlatList
            data={timeSlots}
            renderItem={renderTimeSlot}
            keyExtractor={(item) => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
            accessibilityLabel="Time slots list"
          />
        )}
      </SafeAreaContainer>
    </LinearGradient>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  backButton: {
    padding: Spacing.sm,
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  list: {
    flex: 1,
  },
};

export default DayViewScreen;