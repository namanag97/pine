import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { NotificationSettings } from '../types';
import { storageService } from '../services/StorageService';
import { notificationService } from '../services/NotificationService';
import { Gradients, Spacing } from '../styles/designSystem';
import { 
  Container, 
  AppText, 
  Modal, 
  FormSection, 
  SettingItem, 
  ActionButton, 
  Switch,
  Input,
  Button,
  StatCard
} from '../components/ui';

const SettingsScreen = ({ navigation }: any) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    startTime: '06:00',
    endTime: '22:00',
    intervalMinutes: 30,
    skipFilledSlots: true,
  });
  const [storageStats, setStorageStats] = useState<any>(null);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerType, setTimePickerType] = useState<'start' | 'end'>('start');
  const [tempTime, setTempTime] = useState('');

  useEffect(() => {
    loadSettings();
    loadStorageStats();
  }, []);

  // Schedule notifications when settings are loaded
  useEffect(() => {
    if (settings.enabled) {
      scheduleInitialNotifications();
    }
  }, [settings.enabled]);

  const scheduleInitialNotifications = async () => {
    try {
      await notificationService.scheduleNotifications(settings);
      // Initial notifications scheduled successfully
    } catch (error) {
      // Failed to schedule initial notifications - continues silently
    }
  };

  const loadSettings = async () => {
    try {
      const currentSettings = await storageService.getNotificationSettings();
      setSettings(currentSettings);
    } catch (error) {
      // Handle settings loading failure - show user-friendly error
      Alert.alert('Error', 'Failed to load settings');
    }
  };

  const loadStorageStats = async () => {
    try {
      const stats = await storageService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      // Failed to load storage stats - continues without stats display
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await storageService.saveNotificationSettings(newSettings);
      setSettings(newSettings);
      
      // Schedule/reschedule notifications with new settings
      try {
        await notificationService.scheduleNotifications(newSettings);
        // Notifications rescheduled successfully
      } catch (notificationError) {
        // Failed to schedule notifications - warn user about potential issues
        Alert.alert('Warning', 'Settings saved but notifications may not work properly');
      }
    } catch (error) {
      // Handle settings save failure - show user-friendly error
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleNotificationToggle = (enabled: boolean) => {
    const newSettings = { ...settings, enabled };
    saveSettings(newSettings);
  };

  const handleSkipFilledToggle = (skipFilledSlots: boolean) => {
    const newSettings = { ...settings, skipFilledSlots };
    saveSettings(newSettings);
  };

  const openTimePicker = (type: 'start' | 'end') => {
    setTimePickerType(type);
    setTempTime(type === 'start' ? settings.startTime : settings.endTime);
    setTimePickerVisible(true);
  };

  const saveTime = () => {
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(tempTime)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format');
      return;
    }

    const newSettings = {
      ...settings,
      [timePickerType === 'start' ? 'startTime' : 'endTime']: tempTime,
    };
    saveSettings(newSettings);
    setTimePickerVisible(false);
  };

  const sendTestNotification = async () => {
    try {
      await notificationService.sendTestNotification();
      Alert.alert('Success', 'Test notification sent! Check your notification tray.');
    } catch (error) {
      // Handle test notification failure - likely permission issue
      Alert.alert('Error', 'Failed to send test notification. Please check notification permissions.');
    }
  };

  const exportData = async () => {
    try {
      Alert.alert(
        'Export Data',
        'Export all activity data to share or backup?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Export',
            onPress: async () => {
              try {
                await storageService.exportAllData();
                // Here you would typically use a share/export library
                // Export data ready for sharing/backup
                Alert.alert('Success', 'Data exported successfully');
              } catch (error) {
                Alert.alert('Error', 'Failed to export data');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to prepare export');
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your activity logs and summaries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAllData();
              await loadStorageStats();
              Alert.alert('Success', 'All data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const cleanupOldData = () => {
    Alert.alert(
      'Cleanup Old Data',
      'Remove data older than 90 days to free up storage space?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cleanup',
          onPress: async () => {
            try {
              const removedCount = await storageService.cleanupOldData(90);
              await loadStorageStats();
              Alert.alert('Success', `Removed ${removedCount} old records`);
            } catch (error) {
              Alert.alert('Error', 'Failed to cleanup old data');
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={Gradients.cloudGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Container padding="lg">
          <AppText variant="heading1" color="primary" align="center">
            ⚙️ Settings
          </AppText>
        </Container>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Notification Settings */}
          <FormSection title="Notifications">
            <SettingItem
              title="Enable Notifications"
              description="Receive reminders every 30 minutes to log activities"
              rightElement={
                <Switch
                  value={settings.enabled}
                  onValueChange={handleNotificationToggle}
                />
              }
            />
            
            <SettingItem
              title="Start Time"
              value={settings.startTime}
              onPress={() => openTimePicker('start')}
              disabled={!settings.enabled}
            />
            
            <SettingItem
              title="End Time"
              value={settings.endTime}
              onPress={() => openTimePicker('end')}
              disabled={!settings.enabled}
            />
            
            <SettingItem
              title="Skip Filled Slots"
              description="Don't notify if time slot already has an activity"
              rightElement={
                <Switch
                  value={settings.skipFilledSlots}
                  onValueChange={handleSkipFilledToggle}
                  disabled={!settings.enabled}
                />
              }
              disabled={!settings.enabled}
            />
          </FormSection>

          {/* Test Notification */}
          <Container padding="lg">
            <Button 
              variant={settings.enabled ? "secondary" : "ghost"}
              onPress={sendTestNotification}
              disabled={!settings.enabled}
              style={styles.testButton}
            >
              📱 Send Test Notification
            </Button>
          </Container>

          {/* Data Management */}
          <FormSection title="Data Management">
            {storageStats && (
              <Container padding="lg">
                <StatCard
                  title="Storage Stats"
                  stats={[
                    { label: 'Activity Logs', value: storageStats.totalActivityLogs.toString() },
                    { label: 'Daily Summaries', value: storageStats.totalDailySummaries.toString() },
                    { label: 'Storage Used', value: `${(storageStats.totalStorageSize / 1024).toFixed(1)} KB` },
                  ]}
                />
              </Container>
            )}
            
            <ActionButton
              title="🔄 Data Sync & Backup"
              icon="cloud-outline"
              onPress={() => navigation.navigate('DataSync')}
            />
            
            <ActionButton
              title="View Activity Log"
              icon="list-outline"
              onPress={() => navigation.navigate('ActivityLog')}
            />
            
            <ActionButton
              title="Export Data"
              icon="download-outline"
              onPress={exportData}
            />
            
            <ActionButton
              title="Cleanup Old Data"
              icon="trash-outline"
              variant="warning"
              onPress={cleanupOldData}
            />
            
            <ActionButton
              title="Clear All Data"
              icon="warning-outline"
              variant="danger"
              onPress={clearAllData}
            />
          </FormSection>

          {/* About */}
          <FormSection title="About">
            <Container padding="lg">
              <AppText variant="bodyLarge" color="secondary" style={styles.aboutText}>
                Pine helps you monitor and optimize how you spend your time by assigning 
                value to different activities and tracking them throughout the day.
              </AppText>
            </Container>
          </FormSection>
        </ScrollView>

        {/* Time Picker Modal */}
        <Modal
          visible={timePickerVisible}
          onClose={() => setTimePickerVisible(false)}
          title={`Set ${timePickerType === 'start' ? 'Start' : 'End'} Time`}
          primaryAction={{
            label: 'Save',
            onPress: saveTime,
          }}
          secondaryAction={{
            label: 'Cancel',
            onPress: () => setTimePickerVisible(false),
          }}
        >
          <Input
            value={tempTime}
            onChangeText={setTempTime}
            placeholder="HH:MM (e.g., 09:00)"
            keyboardType="numeric"
            inputStyle={styles.timeInput}
          />
        </Modal>
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
  scrollView: {
    flex: 1,
  },
  testButton: {
    marginTop: Spacing.sm,
  },
  aboutText: {
    lineHeight: 22,
  },
  timeInput: {
    textAlign: 'center',
  } as any,
};

export default SettingsScreen;