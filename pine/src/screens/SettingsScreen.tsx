import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Switch, Alert, TextInput, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { NotificationSettings } from '../types';
import { storageService } from '../services/StorageService';
import { notificationService } from '../services/NotificationService';

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
      console.log('Initial notifications scheduled');
    } catch (error) {
      console.error('Failed to schedule initial notifications:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const currentSettings = await storageService.getNotificationSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    }
  };

  const loadStorageStats = async () => {
    try {
      const stats = await storageService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await storageService.saveNotificationSettings(newSettings);
      setSettings(newSettings);
      
      // Schedule/reschedule notifications with new settings
      try {
        await notificationService.scheduleNotifications(newSettings);
        console.log('Notifications rescheduled successfully');
      } catch (notificationError) {
        console.error('Failed to schedule notifications:', notificationError);
        Alert.alert('Warning', 'Settings saved but notifications may not work properly');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
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
      console.error('Failed to send test notification:', error);
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
                const exportData = await storageService.exportAllData();
                // Here you would typically use a share/export library
                console.log('Export data ready:', exportData);
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
    <ScrollView style={styles.container}>
      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Enable Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive reminders every 30 minutes to log activities
            </Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
            thumbColor={settings.enabled ? '#3B82F6' : '#F3F4F6'}
          />
        </View>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => openTimePicker('start')}
          disabled={!settings.enabled}
        >
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, !settings.enabled && styles.disabled]}>
              Start Time
            </Text>
            <Text style={[styles.settingValue, !settings.enabled && styles.disabled]}>
              {settings.startTime}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => openTimePicker('end')}
          disabled={!settings.enabled}
        >
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, !settings.enabled && styles.disabled]}>
              End Time
            </Text>
            <Text style={[styles.settingValue, !settings.enabled && styles.disabled]}>
              {settings.endTime}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={styles.settingRow}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, !settings.enabled && styles.disabled]}>
              Skip Filled Slots
            </Text>
            <Text style={[styles.settingDescription, !settings.enabled && styles.disabled]}>
              Don't notify if time slot already has an activity
            </Text>
          </View>
          <Switch
            value={settings.skipFilledSlots}
            onValueChange={handleSkipFilledToggle}
            disabled={!settings.enabled}
            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
            thumbColor={settings.skipFilledSlots ? '#3B82F6' : '#F3F4F6'}
          />
        </View>

        <TouchableOpacity 
          style={[styles.testButton, !settings.enabled && styles.disabledButton]} 
          onPress={sendTestNotification}
          disabled={!settings.enabled}
        >
          <Ionicons name="notifications-outline" size={20} color={settings.enabled ? "#3B82F6" : "#9CA3AF"} />
          <Text style={[styles.testButtonText, !settings.enabled && styles.disabled]}>
            Send Test Notification
          </Text>
        </TouchableOpacity>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        {storageStats && (
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Activity Logs:</Text>
              <Text style={styles.statValue}>{storageStats.totalActivityLogs}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Daily Summaries:</Text>
              <Text style={styles.statValue}>{storageStats.totalDailySummaries}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Storage Used:</Text>
              <Text style={styles.statValue}>
                {(storageStats.totalStorageSize / 1024).toFixed(1)} KB
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => navigation.navigate('ActivityLog')}
        >
          <Ionicons name="list-outline" size={20} color="#3B82F6" />
          <Text style={styles.actionButtonText}>View Activity Log</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={exportData}>
          <Ionicons name="download-outline" size={20} color="#3B82F6" />
          <Text style={styles.actionButtonText}>Export Data</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={cleanupOldData}>
          <Ionicons name="trash-outline" size={20} color="#F59E0B" />
          <Text style={[styles.actionButtonText, { color: '#F59E0B' }]}>
            Cleanup Old Data
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={clearAllData}>
          <Ionicons name="warning-outline" size={20} color="#EF4444" />
          <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
            Clear All Data
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          Activity Value Tracker helps you monitor and optimize how you spend your time 
          by assigning value to different activities and tracking them throughout the day.
        </Text>
      </View>

      {/* Time Picker Modal */}
      <Modal visible={timePickerVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Set {timePickerType === 'start' ? 'Start' : 'End'} Time
            </Text>
            <TextInput
              style={styles.timeInput}
              value={tempTime}
              onChangeText={setTempTime}
              placeholder="HH:MM"
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setTimePickerVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={saveTime}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  settingValue: {
    fontSize: 16,
    color: '#3B82F6',
    marginTop: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#3B82F6',
    marginLeft: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  testButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default SettingsScreen;