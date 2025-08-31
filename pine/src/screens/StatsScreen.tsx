import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/designSystem';
import { storageService } from '../services/StorageService';
import { timeSlotService } from '../services/TimeSlotService';
import { formatIndianNumber } from '../utils/indianNumberFormat';

interface StatsScreenProps {
  navigation: any;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ navigation }) => {
  const [dailyStats, setDailyStats] = useState({
    totalHoursSpent: 0,
    hoursWithZeroValue: 0,
    totalValue: 0,
    avgHourlyValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const today = new Date();
      
      // Generate time slots for today
      const timeSlots = timeSlotService.generateTimeSlotsForDate(today);
      
      // Get stored activity logs for today
      const storedLogs = await storageService.getActivityLogsForDate(today);
      const populatedTimeSlots = timeSlots.map(slot => {
        const log = storedLogs.find(l => l.id === slot.id);
        if (log) {
          const activity = { id: log.activityId, name: log.activityName, 
                           hourlyValue: log.hourlyValue, blockValue: log.blockValue,
                           category: '', searchTags: [] };
          return timeSlotService.updateTimeSlotActivity(slot, activity);
        }
        return slot;
      });

      // Calculate stats
      const filledSlots = populatedTimeSlots.filter(s => s.activity);
      const zeroValueSlots = filledSlots.filter(s => s.value === 0);
      const totalValue = filledSlots.reduce((sum, slot) => sum + slot.value, 0);
      
      setDailyStats({
        totalHoursSpent: filledSlots.length,
        hoursWithZeroValue: zeroValueSlots.length,
        totalValue,
        avgHourlyValue: filledSlots.length > 0 ? totalValue / filledSlots.length : 0,
      });
      
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ title: string; value: string; subtitle: string; icon: string; color: string }> = ({
    title, value, subtitle, icon, color
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  return (
    <LinearGradient colors={Colors.skyGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.primaryBlue} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📊 Statistics</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading statistics...</Text>
            </View>
          ) : (
            <>
              {/* Today's Overview */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>TODAY'S STATS</Text>
                <View style={styles.statsGrid}>
                  <StatCard
                    title="Hours Spent"
                    value={`${dailyStats.totalHoursSpent}`}
                    subtitle="Total logged hours"
                    icon="time-outline"
                    color={Colors.primaryBlue}
                  />
                  <StatCard
                    title="Zero Value Hours"
                    value={`${dailyStats.hoursWithZeroValue}`}
                    subtitle="No value activities"
                    icon="close-circle-outline"
                    color={Colors.warningAmber}
                  />
                  <StatCard
                    title="Total Value"
                    value={`₹${formatIndianNumber(dailyStats.totalValue)}`}
                    subtitle="Today's earnings"
                    icon="trending-up"
                    color={Colors.successGreen}
                  />
                  <StatCard
                    title="Avg/Hour"
                    value={`₹${formatIndianNumber(Math.round(dailyStats.avgHourlyValue))}`}
                    subtitle="Per hour rate"
                    icon="calculator"
                    color={Colors.premiumGold}
                  />
                </View>
              </View>

              {/* Coming Soon */}
              <View style={styles.comingSoonCard}>
                <Ionicons name="analytics" size={40} color={Colors.shadowGray} />
                <Text style={styles.comingSoonTitle}>Advanced Analytics Coming Soon</Text>
                <Text style={styles.comingSoonText}>
                  • Weekly & monthly trends{'\n'}
                  • Activity category breakdowns{'\n'}
                  • Goal tracking & achievements{'\n'}
                  • Detailed time analysis
                </Text>
              </View>
            </>
          )}
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cloudWhite + '90',
    borderBottomWidth: 1,
    borderBottomColor: Colors.mistGray,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    ...Typography.headline,
    color: Colors.primaryBlue,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.bodySmall,
    color: Colors.primaryBlue,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.cloudWhite,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    width: '48%',
    marginBottom: Spacing.md,
    ...Shadows.soft,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statTitle: {
    ...Typography.bodySmall,
    color: Colors.shadowGray,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
  statValue: {
    ...Typography.headline,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statSubtitle: {
    ...Typography.caption,
    color: Colors.shadowGray,
  },
  comingSoonCard: {
    backgroundColor: Colors.cloudWhite,
    borderRadius: BorderRadius.medium,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
    ...Shadows.soft,
  },
  comingSoonTitle: {
    ...Typography.bodyLarge,
    color: Colors.primaryBlue,
    fontWeight: 'bold',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  comingSoonText: {
    ...Typography.bodySmall,
    color: Colors.shadowGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  loadingText: {
    ...Typography.bodyLarge,
    color: Colors.shadowGray,
    textAlign: 'center',
  },
});

export default StatsScreen;