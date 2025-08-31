import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Alert, SafeAreaView, ActivityIndicator, FlatList, TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Activity, TimeSlot } from '../types';
import { activityService } from '../services/ActivityService';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/designSystem';
import { formatIndianNumber } from '../utils/indianNumberFormat';

const ActivitySelectionScreen = ({ route, navigation }: any) => {
  const { timeSlot, onActivitySelected }: { 
    timeSlot: TimeSlot; 
    onActivitySelected: (activity: Activity | null) => void; 
  } = route.params;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const allActivities = activityService.getAllActivities();
      
      // Sort by hourly value ascending (lowest first)
      const sortedActivities = [...allActivities].sort((a, b) => a.hourlyValue - b.hourlyValue);
      setActivities(sortedActivities);
      
    } catch (error) {
      console.error('Failed to load activities:', error);
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    if (!searchQuery.trim()) {
      setFilteredActivities(activities);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = activities.filter(activity =>
      activity.name.toLowerCase().includes(query) ||
      activity.category.toLowerCase().includes(query) ||
      activity.searchTags.some(tag => tag.toLowerCase().includes(query))
    );
    
    setFilteredActivities(filtered);
  };

  const handleActivitySelect = (activity: Activity) => {
    onActivitySelected(activity);
    navigation.goBack();
  };

  const handleRemoveActivity = () => {
    Alert.alert(
      'Remove Activity',
      'Are you sure you want to remove the activity from this time slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onActivitySelected(null);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getValueColor = (value: number) => {
    if (value < 0) return Colors.dangerRed;      // Negative (red)
    if (value >= 100000) return '#FFD700';      // Very high (gold)
    if (value >= 50000) return '#32CD32';       // High (lime green)
    if (value >= 10000) return Colors.successGreen; // Good (green)
    if (value >= 1000) return Colors.primaryBlue;   // Average (blue)
    return '#6B7280';                            // Low (gray)
  };

  const renderActivity = ({ item: activity }: { item: Activity }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => handleActivitySelect(activity)}
    >
      <View style={styles.activityContent}>
        <Text style={styles.activityName}>{activity.name}</Text>
        <Text style={[styles.activityValue, { color: getValueColor(activity.hourlyValue) }]}>
          {formatIndianNumber(activity.blockValue)} for 30 min
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.shadowGray} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={Colors.cloudGradient} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primaryBlue} />
            <Text style={styles.loadingText}>Loading activities...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Colors.cloudGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.shadowGray} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Select Activity</Text>
            <Text style={styles.headerSubtitle}>
              {format(timeSlot.startTime, 'h:mm a')} - {format(timeSlot.endTime, 'h:mm a')}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.shadowGray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities..."
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

        {/* Activities List */}
        <FlatList
          data={filteredActivities}
          renderItem={renderActivity}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchQuery ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No activities found</Text>
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              </View>
            ) : null
          }
        />

        {/* Remove Activity Button (if there's already an activity) */}
        {timeSlot.activity && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.removeButton} onPress={handleRemoveActivity}>
              <Text style={styles.removeButtonText}>Remove Current Activity</Text>
            </TouchableOpacity>
          </View>
        )}
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
    padding: Spacing.xxl,
  },
  loadingText: {
    ...Typography.bodyLarge,
    color: Colors.shadowGray,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.cloudWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mistGray,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  headerTitle: {
    ...Typography.headline,
    color: Colors.primaryBlue,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.shadowGray,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: Spacing.lg,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cloudWhite,
    marginHorizontal: Spacing.lg, // Reduced margin
    marginVertical: Spacing.xs, // Much smaller vertical margin
    paddingHorizontal: Spacing.md, // Reduced padding
    paddingVertical: Spacing.sm, // Much smaller vertical padding
    borderRadius: BorderRadius.small, // Smaller border radius
    ...Shadows.soft,
    minHeight: 50, // Much smaller height
  },
  activityContent: {
    flex: 1,
    flexDirection: 'row', // Put name and value on same line
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityName: {
    ...Typography.bodySmall, // Smaller text
    color: Colors.primaryBlue,
    fontWeight: '600',
    flex: 1,
    fontSize: 14,
  },
  activityValue: {
    ...Typography.caption, // Much smaller text
    fontWeight: '600',
    fontSize: 12,
    marginLeft: Spacing.sm,
  },
  footer: {
    backgroundColor: Colors.cloudWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.mistGray,
    padding: Spacing.xl,
  },
  removeButton: {
    backgroundColor: Colors.dangerRed,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    ...Shadows.medium,
  },
  removeButtonText: {
    ...Typography.bodyLarge,
    color: Colors.cloudWhite,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cloudWhite,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.mistGray,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
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

export default ActivitySelectionScreen;