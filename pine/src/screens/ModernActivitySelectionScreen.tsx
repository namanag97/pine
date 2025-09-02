// Pine App - Modern Activity Selection Screen
// Redesigned with modern design system and improved UX

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Activity, TimeSlot } from '../types';
import { activityService } from '../services/ActivityService';

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
  ActivitySearchBar,
  ActivityValueBadge,
  CurrencyText,
  SemanticColors,
  ModernSpacing,
  getModernActivityLevelInfo
} from '../components/ModernUI';

interface ActivitySelectionScreenProps {
  route: {
    params: {
      timeSlot: TimeSlot;
      onActivitySelected: (activity: Activity | null) => void;
    };
  };
  navigation: any;
}

const ModernActivitySelectionScreen: React.FC<ActivitySelectionScreenProps> = ({ 
  route, 
  navigation 
}) => {
  const { timeSlot, onActivitySelected } = route.params;
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    timeSlot.activity || null
  );

  // Load activities
  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const allActivities = activityService.getAllActivities();
      setActivities(allActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Filtered and categorized activities
  const { categorizedActivities, searchResults } = useMemo(() => {
    let filteredActivities = activities;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredActivities = activities.filter(activity =>
        activity.name.toLowerCase().includes(query) ||
        activity.category.toLowerCase().includes(query) ||
        activity.searchTags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Group by value tiers for better organization
    const tiers = {
      premium: filteredActivities.filter(a => a.hourlyValue >= 2000000),
      executive: filteredActivities.filter(a => a.hourlyValue >= 200000 && a.hourlyValue < 2000000),
      highValue: filteredActivities.filter(a => a.hourlyValue >= 20000 && a.hourlyValue < 200000),
      professional: filteredActivities.filter(a => a.hourlyValue >= 2000 && a.hourlyValue < 20000),
      basic: filteredActivities.filter(a => a.hourlyValue >= 200 && a.hourlyValue < 2000),
      lowValue: filteredActivities.filter(a => a.hourlyValue >= 0 && a.hourlyValue < 200),
      negative: filteredActivities.filter(a => a.hourlyValue < 0)
    };

    return {
      categorizedActivities: tiers,
      searchResults: filteredActivities
    };
  }, [activities, searchQuery]);

  // Handle activity selection
  const handleActivitySelect = useCallback((activity: Activity) => {
    setSelectedActivity(activity);
  }, []);

  // Confirm selection
  const handleConfirm = useCallback(() => {
    onActivitySelected(selectedActivity);
    navigation.goBack();
  }, [selectedActivity, onActivitySelected, navigation]);

  // Clear selection
  const handleClear = useCallback(() => {
    setSelectedActivity(null);
    onActivitySelected(null);
    navigation.goBack();
  }, [onActivitySelected, navigation]);

  // Activity item component
  const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
    const isSelected = selectedActivity?.id === activity.id;
    const levelInfo = getModernActivityLevelInfo(activity.hourlyValue);

    return (
      <TouchableOpacity onPress={() => handleActivitySelect(activity)}>
        <Card 
          variant={isSelected ? 'premium' : 'default'}
          style={{
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? levelInfo.color : SemanticColors.border.primary
          }}
        >
          <Stack direction="row" align="center" justify="space-between">
            <View style={{ flex: 1 }}>
              <Body size="medium" color="primary" numberOfLines={2}>
                {activity.name}
              </Body>
              <Caption color="secondary" numberOfLines={1} style={{ marginTop: ModernSpacing['1'] }}>
                {activity.category}
              </Caption>
            </View>
            
            <Stack align="flex-end" spacing="2">
              <CurrencyText value={activity.hourlyValue} size="medium" />
              <ActivityValueBadge value={activity.hourlyValue} size="small" />
            </Stack>
          </Stack>
        </Card>
      </TouchableOpacity>
    );
  };

  // Tier section component
  const TierSection: React.FC<{ 
    title: string; 
    activities: Activity[]; 
    icon: string;
    color: string;
  }> = ({ title, activities, icon, color }) => {
    if (activities.length === 0) return null;

    return (
      <Stack spacing="3">
        <Stack direction="row" align="center" spacing="3">
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: color + '20',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Body size="medium">{icon}</Body>
          </View>
          <Stack>
            <Heading level={6} color="primary">{title}</Heading>
            <Caption color="secondary">{activities.length} activities</Caption>
          </Stack>
        </Stack>
        
        <Stack spacing="2">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </Stack>
      </Stack>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: SemanticColors.background.primary }}>
        <StatusBar barStyle="dark-content" backgroundColor={SemanticColors.background.primary} />
        <Container style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Stack align="center" spacing="4">
            <Display size="medium">📋</Display>
            <Body size="large" color="secondary" align="center">
              Loading activities...
            </Body>
          </Stack>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SemanticColors.background.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={SemanticColors.background.primary} />
      
      {/* Header */}
      <Container>
        <Stack direction="row" align="center" justify="space-between" spacing="4">
          <Button
            variant="ghost"
            icon="arrow-back"
            onPress={() => navigation.goBack()}
          />
          
          <View style={{ flex: 1 }}>
            <Heading level={5} color="primary" align="center">
              Select Activity
            </Heading>
            <Caption color="secondary" align="center">
              {timeSlot.startTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} - {timeSlot.endTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Caption>
          </View>
          
          <View style={{ width: 40 }} />
        </Stack>
      </Container>

      {/* Search Bar */}
      <Container>
        <ActivitySearchBar
          onSearch={setSearchQuery}
          placeholder="Search activities, categories, or tags..."
        />
      </Container>

      {/* Selected Activity Display */}
      {selectedActivity && (
        <Container>
          <Card variant="premium">
            <Stack spacing="3">
              <Stack direction="row" align="center" justify="space-between">
                <Heading level={6} color="primary">Selected Activity</Heading>
                <Button
                  variant="ghost"
                  icon="close"
                  size="small"
                  onPress={() => setSelectedActivity(null)}
                />
              </Stack>
              
              <Stack direction="row" align="center" justify="space-between">
                <View style={{ flex: 1 }}>
                  <Body size="large" color="primary">
                    {selectedActivity.name}
                  </Body>
                  <Caption color="secondary">
                    {selectedActivity.category}
                  </Caption>
                </View>
                <Stack align="flex-end" spacing="2">
                  <CurrencyText value={selectedActivity.hourlyValue} size="large" />
                  <ActivityValueBadge value={selectedActivity.hourlyValue} size="medium" />
                </Stack>
              </Stack>
            </Stack>
          </Card>
        </Container>
      )}

      {/* Activities List */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: ModernSpacing['20'] }}
      >
        <Container>
          <Stack spacing="6">
            {searchQuery.trim() ? (
              // Search results
              <>
                <Stack spacing="3">
                  <Heading level={6} color="primary">
                    Search Results ({searchResults.length})
                  </Heading>
                  <Stack spacing="2">
                    {searchResults.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </Stack>
                </Stack>
              </>
            ) : (
              // Categorized by tiers
              <>
                <TierSection
                  title="CEO Level"
                  activities={categorizedActivities.premium}
                  icon="👑"
                  color="#EAB308"
                />
                <TierSection
                  title="Executive"
                  activities={categorizedActivities.executive}
                  icon="🎯"
                  color="#059669"
                />
                <TierSection
                  title="High Value"
                  activities={categorizedActivities.highValue}
                  icon="✨"
                  color="#D97706"
                />
                <TierSection
                  title="Professional"
                  activities={categorizedActivities.professional}
                  icon="💼"
                  color="#475569"
                />
                <TierSection
                  title="Basic Tasks"
                  activities={categorizedActivities.basic}
                  icon="📝"
                  color="#64748B"
                />
                <TierSection
                  title="Low Value"
                  activities={categorizedActivities.lowValue}
                  icon="📋"
                  color="#94A3B8"
                />
                {categorizedActivities.negative.length > 0 && (
                  <TierSection
                    title="Time Drains"
                    activities={categorizedActivities.negative}
                    icon="⚠️"
                    color="#EF4444"
                  />
                )}
              </>
            )}

            {activities.length === 0 && !loading && (
              <Stack align="center" spacing="4" style={{ marginTop: ModernSpacing['12'] }}>
                <Display size="medium">📝</Display>
                <Body size="large" color="secondary" align="center">
                  No activities found
                </Body>
                <Button variant="secondary" icon="add-outline">
                  Add New Activity
                </Button>
              </Stack>
            )}
          </Stack>
        </Container>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View 
        style={{
          padding: ModernSpacing['4'],
          backgroundColor: SemanticColors.surface.primary,
          borderTopWidth: 1,
          borderTopColor: SemanticColors.border.primary
        }}
      >
        <Container>
          <Stack direction="row" spacing="3">
            <View style={{ flex: 1 }}>
              <Button
                variant="secondary"
                fullWidth
                onPress={handleClear}
                icon="trash-outline"
              >
                Clear Activity
              </Button>
            </View>
            <View style={{ flex: 2 }}>
              <Button
                variant="primary"
                fullWidth
                onPress={handleConfirm}
                disabled={!selectedActivity}
                icon="checkmark-outline"
              >
                {selectedActivity ? 'Confirm Selection' : 'Select an Activity'}
              </Button>
            </View>
          </Stack>
        </Container>
      </View>
    </SafeAreaView>
  );
};

export default ModernActivitySelectionScreen;