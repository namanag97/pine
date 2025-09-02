import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, TouchableOpacity, 
  Alert, SafeAreaView, ActivityIndicator, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Activity, TimeSlot } from '../types';
import { activityService } from '../services/ActivityService';
import { 
  Gradients,
  SemanticColors, 
  Spacing, 
} from '../styles/designSystem';
import {
  Container,
  Stack,
  Button,
  AppText,
  CategorySection,
  ActivityItem,
  ActivitySearchBar,
  getCategoryColors,
  getCategoryInfo,
} from '../components/ui';

const ActivitySelectionScreen = ({ route, navigation }: any) => {
  const { timeSlot, onActivitySelected }: { 
    timeSlot: TimeSlot; 
    onActivitySelected: (activity: Activity | null) => void; 
  } = route.params;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  // Define value tier ranges for categorization
  const valueTiers = [
    { min: 2000000, max: Infinity },   // CEO Level
    { min: 200000, max: 2000000 },    // Executive
    { min: 20000, max: 200000 },      // High-Value
    { min: 2000, max: 20000 },        // Professional
    { min: 200, max: 2000 },          // Basic
    { min: 100, max: 200 },           // Low-Value
    { min: 0, max: 100 },             // Free
    { min: -Infinity, max: 0 },       // Negative
  ];

  // Group activities by value tiers
  const categorizedActivities = useMemo(() => {
    const filteredActivities = searchQuery.trim() 
      ? activities.filter(activity =>
          activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.searchTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : activities;

    return valueTiers.map(tier => {
      const tierActivities = filteredActivities.filter(activity => 
        activity.hourlyValue >= tier.min && activity.hourlyValue < tier.max
      ).sort((a, b) => b.hourlyValue - a.hourlyValue); // Sort by value descending within tier

      return {
        tier,
        activities: tierActivities,
        ...getCategoryInfo(tier.min),
        ...getCategoryColors(tier.min),
      };
    }).filter(category => category.activities.length > 0); // Only show categories with activities
  }, [activities, searchQuery]);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const allActivities = activityService.getAllActivities();
      setActivities(allActivities);
    } catch (error) {
      // Handle activity loading failure - show user-friendly error
      Alert.alert('Error', 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleActivitySelect = useCallback((activity: Activity) => {
    onActivitySelected(activity);
    navigation.goBack();
  }, [onActivitySelected, navigation]);

  const handleRemoveActivity = useCallback(() => {
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
  }, [onActivitySelected, navigation]);

  const renderCategoryActivities = (activities: Activity[]) => (
    <Stack spacing="xs">
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          onPress={handleActivitySelect}
          style={index === activities.length - 1 ? { borderBottomWidth: 0 } : undefined}
        />
      ))}
    </Stack>
  );

  if (loading) {
    return (
      <LinearGradient colors={Gradients.cloudGradient} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={SemanticColors.text.link} />
            <AppText variant="bodyLarge" color="secondary" style={{ marginTop: Spacing.lg, textAlign: 'center' }}>
              Loading activities...
            </AppText>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Gradients.cloudGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={SemanticColors.text.secondary} />
          </TouchableOpacity>
          <Stack spacing="xs" style={{ flex: 1, marginLeft: Spacing.lg }}>
            <AppText variant="heading3" color="primary">
              Select Activity
            </AppText>
            <AppText variant="bodyRegular" color="secondary">
              {format(timeSlot.startTime, 'h:mm a')} - {format(timeSlot.endTime, 'h:mm a')}
            </AppText>
          </Stack>
        </View>

        {/* Search Bar */}
        <ActivitySearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search activities..."
        />

        {/* Categorized Activities */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {categorizedActivities.length === 0 && searchQuery ? (
            <Container padding="xl">
              <Stack align="center" spacing="sm">
                <AppText variant="bodyLarge" color="secondary" align="center">
                  No activities found
                </AppText>
                <AppText variant="bodySmall" color="tertiary" align="center">
                  Try a different search term
                </AppText>
              </Stack>
            </Container>
          ) : (
            categorizedActivities.map((category, index) => (
              <CategorySection
                key={`${category.tier.min}-${category.tier.max}`}
                title={category.title}
                icon={category.icon}
                valueRange={category.valueRange}
                activityCount={category.activities.length}
                backgroundColor={category.backgroundColor}
                textColor={category.textColor}
                defaultExpanded={index === 0}
              >
                {renderCategoryActivities(category.activities)}
              </CategorySection>
            ))
          )}
        </ScrollView>

        {/* Remove Activity Button (if there's already an activity) */}
        {timeSlot.activity && (
          <View style={styles.footer}>
            <Container padding="xl">
              <Button 
                variant="danger"
                onPress={handleRemoveActivity}
              >
                Remove Current Activity
              </Button>
            </Container>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: Spacing['3xl'],
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: SemanticColors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.primary,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  footer: {
    backgroundColor: SemanticColors.surface.primary,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.primary,
    padding: 0, // Padding handled by Container
  },
};

export default ActivitySelectionScreen;