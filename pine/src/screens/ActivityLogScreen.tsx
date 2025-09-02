import React, { useState, useEffect } from 'react';
import { 
  View, FlatList, TouchableOpacity, 
  Alert, RefreshControl, ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { format, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { StoredActivityLog } from '../types';
import { storageService } from '../services/StorageService';
import { Gradients, Colors, Spacing } from '../styles/designSystem';
import { getValueDisplayWithSign } from '../utils/indianNumberFormat';
import { 
  Container, 
  Stack, 
  AppText, 
  Card, 
  StatCard,
  SearchInput,
  SafeAreaContainer
} from '../components/ui';

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
      // Failed to load activity logs
      Alert.alert('Error', 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAllLogs();
    } catch (error) {
      // Failed to refresh logs
      Alert.alert('Refresh Failed', 'Unable to refresh activity logs. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const filterLogs = () => {
    try {
      if (!searchQuery.trim()) {
        setFilteredLogs(allLogs);
        return;
      }

      const query = searchQuery.toLowerCase();
      const filtered = allLogs.filter(log => {
        try {
          return log.activityName.toLowerCase().includes(query) ||
            format(parseISO(log.timeSlotStart), 'MMM dd, yyyy').toLowerCase().includes(query);
        } catch (dateError) {
          // Invalid date format in log entry
          // Include logs with invalid dates in search if activity name matches
          return log.activityName.toLowerCase().includes(query);
        }
      });
      
      setFilteredLogs(filtered);
    } catch (error) {
      // Error filtering logs
      // Fallback to showing all logs if filtering fails
      setFilteredLogs(allLogs);
    }
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
              // Provide success feedback
              Alert.alert('Success', 'Activity log deleted successfully');
            } catch (error) {
              // Failed to delete activity log
              Alert.alert(
                'Delete Failed', 
                'Unable to delete the activity log. Please try again.', 
                [
                  { text: 'OK' },
                  { 
                    text: 'Retry', 
                    onPress: () => {
                      // Retry the deletion
                      handleDeleteLog(logId);
                    } 
                  }
                ]
              );
            }
          },
        },
      ]
    );
  };

  const renderLogItem = ({ item }: { item: StoredActivityLog }) => {
    const startTime = parseISO(item.timeSlotStart);
    const valueDisplay = getValueDisplayWithSign(item.blockValue);
    const isHighValue = item.blockValue >= 10000;
    
    return (
      <Container padding="md">
        <Card 
          variant={isHighValue ? "elevated" : "outlined"} 
          padding="medium" 
          style={isHighValue ? { borderLeftWidth: 4, borderLeftColor: Colors.success[600] } : undefined}
        >
          <Stack direction="horizontal" justify="space-between" align="center">
            <Stack spacing="xs" style={{ flex: 1 }}>
              <Stack direction="horizontal" justify="space-between" align="center">
                <AppText variant="bodyLarge" color="primary" style={{ fontWeight: '600', flex: 1 }}>
                  {item.activityName}
                </AppText>
                <AppText variant="numerical" style={{ color: valueDisplay.color }}>
                  {valueDisplay.text}
                  {isHighValue && ' ✨'}
                </AppText>
              </Stack>
              
              <AppText variant="bodySmall" color="secondary">
                📅 {format(startTime, 'MMM dd, yyyy')} • ⏰ {format(startTime, 'h:mm a')} - {format(parseISO(item.timeSlotEnd), 'h:mm a')}
              </AppText>
            </Stack>
            
            <TouchableOpacity
              onPress={() => handleDeleteLog(item.id)}
              style={{ padding: Spacing.sm, marginLeft: Spacing.sm }}
              accessibilityLabel={`Delete ${item.activityName} activity`}
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error[600]} />
            </TouchableOpacity>
          </Stack>
        </Card>
      </Container>
    );
  };

  const getTotalValue = () => {
    return filteredLogs.reduce((sum, log) => sum + log.blockValue, 0);
  };

  const totalValue = getValueDisplayWithSign(getTotalValue());

  if (loading) {
    return (
      <LinearGradient colors={Gradients.skyGradient} style={styles.container}>
        <Container padding="xl">
          <Stack align="center" spacing="md">
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <AppText variant="bodyLarge" color="secondary" align="center">
              Loading activity logs...
            </AppText>
          </Stack>
        </Container>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Gradients.skyGradient} style={styles.container}>
      <SafeAreaContainer>
        {/* Header */}
        <Container padding="lg">
          <Stack direction="horizontal" align="center" justify="space-between">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
            <AppText variant="heading1" color="primary">
              📋 Activity Log
            </AppText>
            <View style={styles.placeholder} />
          </Stack>
        </Container>

        {/* Search Bar */}
        <Container padding="lg">
          <SearchInput
            placeholder="Search activities or dates..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            showClearButton={searchQuery.length > 0}
          />
        </Container>

        {/* Summary */}
        <Container padding="lg">
          <StatCard
            title="Activity Summary"
            stats={[
              { label: 'Total Activities', value: filteredLogs.length.toString() },
              { label: 'Total Value', value: totalValue.text },
            ]}
          />
        </Container>

        {/* Activity List */}
        <FlatList
          data={filteredLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Container padding="xl">
              <Stack align="center" spacing="md">
                <AppText variant="bodyLarge" color="secondary" align="center">
                  {searchQuery ? 'No activities found matching your search.' : 'No activities logged yet.'}
                </AppText>
                <AppText variant="bodySmall" color="tertiary" align="center">
                  {searchQuery ? 'Try a different search term.' : 'Start logging activities to see them here.'}
                </AppText>
              </Stack>
            </Container>
          }
          contentInsetAdjustmentBehavior="automatic"
          accessibilityLabel="Activity list"
        />
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

export default ActivityLogScreen;