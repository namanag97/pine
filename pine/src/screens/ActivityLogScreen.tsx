import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Alert, TextInput, RefreshControl, ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { StoredActivityLog } from '../types';
import { storageService } from '../services/StorageService';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/designSystem';
import { getValueDisplayWithSign } from '../utils/indianNumberFormat';

const ActivityLogScreen = ({ navigation }: any) => {
  const [allLogs, setAllLogs] = useState<StoredActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<StoredActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [allLogs, searchQuery]);

  const loadAllLogs = async () => {
    try {
      setLoading(true);
      const logs = await storageService.getAllActivityLogs();
      
      // Sort by most recent first
      const sortedLogs = logs.sort((a, b) => 
        new Date(b.timeSlotStart).getTime() - new Date(a.timeSlotStart).getTime()
      );
      
      setAllLogs(sortedLogs);
    } catch (error) {
      console.error('Failed to load activity logs:', error);
      Alert.alert('Error', 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllLogs();
    setRefreshing(false);
  };

  const filterLogs = () => {
    if (!searchQuery.trim()) {
      setFilteredLogs(allLogs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allLogs.filter(log =>
      log.activityName.toLowerCase().includes(query) ||
      format(parseISO(log.timeSlotStart), 'MMM dd, yyyy').toLowerCase().includes(query)
    );
    
    setFilteredLogs(filtered);
  };

  const handleDeleteLog = async (logId: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteActivityLog(logId);
              await loadAllLogs();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete activity log');
            }
          },
        },
      ]
    );
  };

  const renderLogItem = ({ item }: { item: StoredActivityLog }) => {
    const startTime = parseISO(item.timeSlotStart);
    const valueDisplay = getValueDisplayWithSign(item.blockValue);
    
    return (
      <View style={[styles.logItem, item.blockValue >= 10000 && styles.highValueItem]}>
        <View style={styles.logContent}>
          <View style={styles.logHeader}>
            <Text style={styles.activityName}>{item.activityName}</Text>
            <Text style={[styles.value, { color: valueDisplay.color }]}>
              {valueDisplay.text}
              {item.blockValue >= 10000 && ' ✨'}
            </Text>
          </View>
          
          <View style={styles.logDetails}>
            <Text style={styles.timeInfo}>
              📅 {format(startTime, 'MMM dd, yyyy')} • 
              ⏰ {format(startTime, 'h:mm a')} - {format(parseISO(item.timeSlotEnd), 'h:mm a')}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteLog(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.dangerRed} />
        </TouchableOpacity>
      </View>
    );
  };

  const getTotalValue = () => {
    return filteredLogs.reduce((sum, log) => sum + log.blockValue, 0);
  };

  const totalValue = getValueDisplayWithSign(getTotalValue());

  if (loading) {
    return (
      <LinearGradient colors={Colors.skyGradient} style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
          <Text style={styles.loadingText}>Loading activity logs...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Colors.skyGradient} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primaryBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Log</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.shadowGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search activities or dates..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.shadowGray}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.shadowGray} />
          </TouchableOpacity>
        )}
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Activities:</Text>
          <Text style={styles.summaryValue}>{filteredLogs.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Value:</Text>
          <Text style={[styles.summaryValue, { color: totalValue.color }]}>
            {totalValue.text}
          </Text>
        </View>
      </View>

      {/* Activity List */}
      <FlatList
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No activities found matching your search.' : 'No activities logged yet.'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search term.' : 'Start logging activities to see them here.'}
            </Text>
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
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
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    ...Typography.headline,
    color: Colors.primaryBlue,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cloudWhite,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
    ...Shadows.soft,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    ...Typography.bodyLarge,
    flex: 1,
    paddingVertical: Spacing.md,
    color: Colors.primaryBlue,
  },
  summaryCard: {
    backgroundColor: Colors.cloudWhite,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    ...Shadows.soft,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    ...Typography.bodyLarge,
    color: Colors.shadowGray,
    fontWeight: '600',
  },
  summaryValue: {
    ...Typography.bodyLarge,
    color: Colors.primaryBlue,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  logItem: {
    backgroundColor: Colors.cloudWhite,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.soft,
  },
  highValueItem: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: Colors.successGreen,
  },
  logContent: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  activityName: {
    ...Typography.bodyLarge,
    color: Colors.primaryBlue,
    fontWeight: '600',
    flex: 1,
  },
  value: {
    ...Typography.bodyLarge,
    fontWeight: 'bold',
    marginLeft: Spacing.md,
  },
  logDetails: {
    marginTop: Spacing.xs,
  },
  timeInfo: {
    ...Typography.bodySmall,
    color: Colors.shadowGray,
  },
  deleteButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    ...Typography.bodyLarge,
    color: Colors.shadowGray,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    ...Typography.bodySmall,
    color: Colors.shadowGray,
    textAlign: 'center',
  },
});

export default ActivityLogScreen;