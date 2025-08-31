import * as Notifications from 'expo-notifications';
// Removed unused Platform import
import { NotificationSettings, TimeSlot } from '../types';
import { timeSlotService } from './TimeSlotService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationMessage {
  title: string;
  body: string;
  type: 'motivational' | 'contextual' | 'achievement' | 'reminder' | 'time';
}

class NotificationService {
  private notificationIdentifiers: string[] = [];
  private messageIndex = 0;

  private getNotificationMessages(): NotificationMessage[] {
    const now = new Date();
    const hour = now.getHours();
    
    const baseMessages: NotificationMessage[] = [
      // Time-based contextual messages with time display
      {
        title: hour < 10 ? `🌅 Morning Focus Time (${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')})` : 
               hour < 14 ? `☀️ Midday Momentum (${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')})` : 
               hour < 18 ? `⚡ Afternoon Power (${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')})` : 
               `🌙 Evening Reflection (${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')})`,
        body: hour < 10 ? 'Start strong! Log your high-value morning activities' : 
              hour < 14 ? 'Peak hours ahead - what are you accomplishing?' : 
              hour < 18 ? 'Afternoon energy = opportunity. What did you achieve?' : 
              'Evening wind-down. How did you invest your time?',
        type: 'contextual'
      },
      
      // Motivational messages
      { title: '💰 Turn Time Into Money', body: 'Every logged activity builds your income prediction!', type: 'motivational' },
      { title: '🎯 Building Your Future', body: 'Your choices right now shape tomorrow\'s income', type: 'motivational' },
      { title: '⚡ Value Creation Mode', body: 'Time to transform minutes into meaningful progress', type: 'motivational' },
      { title: '📈 Income Accelerator', body: 'High-value activities = higher annual projection', type: 'motivational' },
      { title: '🚀 Productivity Boost', body: 'What high-impact activity did you just complete?', type: 'motivational' },
      
      // Achievement-focused messages
      { title: '🏆 Progress Tracker', body: 'You\'re building momentum! Log your latest win', type: 'achievement' },
      { title: '✨ Success Snapshot', body: 'Every activity logged is a step toward your goals', type: 'achievement' },
      { title: '🎉 Value Builder', body: 'Your consistency is creating compound returns', type: 'achievement' },
      
      // Gentle reminders
      { title: '📊 Quick Check-In', body: 'How did you spend the last 30 minutes?', type: 'reminder' },
      { title: '⏰ Time Checkpoint', body: 'A few seconds to log = clearer income picture', type: 'reminder' },
      { title: '💡 Activity Logger', body: 'What valuable work did you just finish?', type: 'reminder' },
      { title: '📝 Progress Update', body: 'Quick log = better future predictions', type: 'reminder' },
      
      // Time-focused messages with current time
      { title: `⏱️ 30-Minute Milestone (${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')})`, body: 'Time to capture your latest activity value', type: 'time' },
      { title: `🕐 Half-Hour Check (${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')})`, body: 'What did you accomplish in this time block?', type: 'time' },
      { title: `⌚ Activity Window (${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')})`, body: 'Log now for accurate income projections', type: 'time' }
    ];
    
    return baseMessages;
  }

  private getNextNotificationMessage(): NotificationMessage {
    const messages = this.getNotificationMessages();
    const message = messages[this.messageIndex % messages.length];
    this.messageIndex++;
    return message;
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedule notifications based on settings
   */
  async scheduleNotifications(settings: NotificationSettings): Promise<void> {
    try {
      // Cancel existing notifications first
      await this.cancelAllNotifications();

      if (!settings.enabled) {
        return;
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      // Parse start and end times
      const [startHour, startMinute] = settings.startTime.split(':').map(Number);
      const [endHour, endMinute] = settings.endTime.split(':').map(Number);

      // Calculate number of notifications needed
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;
      const totalMinutes = endTimeMinutes - startTimeMinutes;
      const notificationCount = Math.floor(totalMinutes / settings.intervalMinutes);

      // Schedule each notification
      for (let i = 0; i < notificationCount; i++) {
        const notificationTime = startTimeMinutes + (i * settings.intervalMinutes);
        const hour = Math.floor(notificationTime / 60);
        const minute = notificationTime % 60;

        // Skip if time is invalid (24+ hour)
        if (hour >= 24) continue;

        const message = this.getNextNotificationMessage();
        
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: message.title,
            body: message.body,
            data: { 
              type: 'activity-reminder',
              timeSlot: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
              messageType: message.type,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            hour,
            minute,
            repeats: true,
          },
        });

        this.notificationIdentifiers.push(identifier);
      }

      console.log(`Scheduled ${this.notificationIdentifiers.length} notifications`);
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.notificationIdentifiers = [];
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Handle notification response (when user taps notification)
   */
  setupNotificationResponseHandler(
    onNotificationTapped: (timeSlot: TimeSlot) => void
  ): void {
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      
      if (data.type === 'activity-reminder' && data.timeSlot && typeof data.timeSlot === 'string') {
        // Parse time slot from notification data
        const [hour, minute] = data.timeSlot.split(':').map(Number);
        const now = new Date();
        const timeSlotStart = new Date(now);
        timeSlotStart.setHours(hour, minute, 0, 0);
        
        const timeSlot = timeSlotService.createTimeSlotWithActivity(
          timeSlotStart,
          null as any // Will be selected by user
        );
        
        onNotificationTapped(timeSlot);
      }
    });
  }

  /**
   * Check if should send notification for current time slot
   */
  shouldSendNotification(
    timeSlot: TimeSlot,
    settings: NotificationSettings
  ): boolean {
    return timeSlotService.shouldNotifyForTimeSlot(timeSlot, settings);
  }

  /**
   * Send immediate notification (for testing)
   */
  async sendTestNotification(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification from Activity Value Tracker',
          data: { type: 'test' },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }

  /**
   * Get notification settings status
   */
  async getNotificationStatus(): Promise<{
    permissionGranted: boolean;
    scheduledCount: number;
    nextNotification?: Date;
  }> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const scheduled = await this.getScheduledNotifications();
      
      let nextNotification: Date | undefined;
      if (scheduled.length > 0) {
        // Find next scheduled notification
        const triggers = scheduled
          .map(n => n.trigger)
          .filter(t => t && 'hour' in t && 'minute' in t)
          .map(t => {
            const trigger = t as { hour: number; minute: number };
            const next = new Date();
            next.setHours(trigger.hour, trigger.minute, 0, 0);
            if (next <= new Date()) {
              next.setDate(next.getDate() + 1); // Next day
            }
            return next;
          })
          .sort((a, b) => a.getTime() - b.getTime());
        
        nextNotification = triggers[0];
      }

      return {
        permissionGranted: status === 'granted',
        scheduledCount: scheduled.length,
        nextNotification,
      };
    } catch (error) {
      console.error('Failed to get notification status:', error);
      return {
        permissionGranted: false,
        scheduledCount: 0,
      };
    }
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();
export default notificationService;