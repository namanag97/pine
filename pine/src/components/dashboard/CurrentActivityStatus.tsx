import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Timeline, Colors, SemanticColors, getActivityValueStyles } from '../../styles/designSystem';
import { TimeSlot } from '../../types';
import { AppText } from '../ui';

interface CurrentActivityStatusProps {
  currentActivity: TimeSlot | null;
  onStopActivity: () => void;
}

export const CurrentActivityStatus: React.FC<CurrentActivityStatusProps> = ({
  currentActivity,
  onStopActivity
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentActivity?.activity) {
      // Start pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      
      return () => pulse.stop();
    }
  }, [currentActivity?.activity, pulseAnim]);

  // Don't render if no current activity
  if (!currentActivity?.activity) {
    return null;
  }

  const activityStyles = getActivityValueStyles(currentActivity.value || 0);
  const { icon } = activityStyles.iconStyle;
  
  // Calculate remaining time in minutes (assuming 30-minute slots)
  const elapsedMs = new Date().getTime() - currentActivity.startTime.getTime();
  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
  const remainingMinutes = Math.max(0, 30 - elapsedMinutes);
  
  const formattedValue = (currentActivity.activity.hourlyValue || 0).toLocaleString();

  return (
    <View style={Timeline.currentActivityBar}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Animated.View 
            style={[
              styles.pulseIndicator, 
              { 
                opacity: pulseAnim,
                backgroundColor: activityStyles.iconStyle.color 
              }
            ]} 
          />
          
          <View style={styles.activityInfo}>
            <AppText variant="bodyRegular" style={styles.activityTitle}>
              {icon} {currentActivity.activity.name}
            </AppText>
            <AppText variant="caption" color="secondary">
              ₹{formattedValue}/hr • {remainingMinutes} min remaining
            </AppText>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.stopButton}
          onPress={onStopActivity}
          activeOpacity={0.7}
        >
          <AppText variant="caption" style={styles.stopButtonText}>
            Stop
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  
  leftSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  
  pulseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  
  activityInfo: {
    flex: 1,
  },
  
  activityTitle: {
    fontWeight: '600' as const,
    fontSize: 14,
    marginBottom: 2,
    color: SemanticColors.text.primary,
  },
  
  stopButton: {
    backgroundColor: Colors.error[100],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  
  stopButtonText: {
    color: Colors.error[700],
    fontWeight: '600' as const,
    fontSize: 12,
  }
};