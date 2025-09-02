import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StatsHeaderProps {
  todayProjection: number;
  annualProjection: string;
  avgHourlyValue: number;
  efficiency: number;
  onPress?: () => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  todayProjection,
  annualProjection,
  avgHourlyValue,
  efficiency
}) => {
  const formattedTodayProjection = `₹${todayProjection.toLocaleString()}`;
  const formattedAvgHourly = `₹${avgHourlyValue.toLocaleString()}`;

  return (
    <View style={styles.statsCardContainer}>
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']} // Blue gradient matching HTML
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statsCard}
      >
        {/* Main projection section */}
        <View style={styles.mainRow}>
          <View style={styles.todaySection}>
            <Text style={styles.todayLabel}>Today's Projection</Text>
            <Text style={styles.todayValue}>{formattedTodayProjection}</Text>
          </View>
          
          <View style={styles.annualSection}>
            <Text style={styles.annualLabel}>Annual</Text>
            <Text style={styles.annualValue}>{annualProjection}</Text>
          </View>
        </View>
        
        {/* Metrics section */}
        <View style={styles.metricsRow}>
          <Text style={styles.metricText}>📊 Avg: {formattedAvgHourly}/hr</Text>
          <Text style={styles.metricText}>🎯 Efficiency: {efficiency}%</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

// Exact match to HTML reference styles
const styles = {
  // Container matching margin: 16px 20px from HTML
  statsCardContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  
  // Stats card matching HTML gradient and styling
  statsCard: {
    padding: 20,
    borderRadius: 12, // var(--radius-lg)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8, // Android shadow
  },
  
  // Main row: Today's projection + Annual
  mainRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12, // mb-3 from HTML
  },
  
  // Today's projection section
  todaySection: {
    flex: 1,
  },
  
  todayLabel: {
    fontSize: 14, // text-sm
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
    fontWeight: '400',
  },
  
  todayValue: {
    fontSize: 24, // text-2xl
    fontWeight: '700', // font-bold
    color: '#FFFFFF',
    lineHeight: 28,
  },
  
  // Annual section (right side)
  annualSection: {
    alignItems: 'flex-end' as const,
  },
  
  annualLabel: {
    fontSize: 12, // text-xs
    color: '#FFFFFF',
    opacity: 0.75,
    marginBottom: 4,
    fontWeight: '400',
  },
  
  annualValue: {
    fontSize: 18, // text-lg
    fontWeight: '600', // font-semibold
    color: '#FFFFFF',
    lineHeight: 22,
  },
  
  // Metrics row: Avg + Efficiency
  metricsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  
  metricText: {
    fontSize: 14, // text-sm
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
};