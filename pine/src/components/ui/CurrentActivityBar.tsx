import React, { memo, useEffect, useRef, useMemo } from 'react';
import { Animated, TouchableOpacity, ViewStyle } from 'react-native';
import { Activity } from '../../types';
import { 
  SemanticColors, 
  Colors,
  Spacing, 
  BorderRadius,
  Shadows
} from '../../styles/designSystem';
import { AppText } from './Typography';
import { Stack } from './Layout';

export interface CurrentActivityBarProps {
  currentActivity: Activity | null;
  remainingMinutes: number;
  onStopActivity: () => void;
  style?: ViewStyle;
}

export const CurrentActivityBar: React.FC<CurrentActivityBarProps> = memo(({
  currentActivity,
  remainingMinutes,
  onStopActivity,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentActivity) {
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
  }, [currentActivity, pulseAnim]);

  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(0)}M/hr`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K/hr`;
    } else if (value < 0) {
      return `-₹${Math.abs(value)}/hr`;
    } else {
      return `₹${value}/hr`;
    }
  };

  if (!currentActivity) {
    return null;
  }

  const containerStyle = useMemo(() => ({
    ...currentActivityStyles.container,
    ...style,
  }), [style]);

  return (
    <Stack 
      style={containerStyle}
    >
      <Stack direction="horizontal" align="center" justify="space-between">
        <Stack direction="horizontal" align="center" spacing="md">
          {/* Pulsing Indicator */}
          <Animated.View 
            style={[
              currentActivityStyles.pulseIndicator,
              { opacity: pulseAnim }
            ]}
          />
          
          {/* Activity Info */}
          <Stack spacing="xs">
            <AppText 
              variant="bodyRegular" 
              color="primary"
              numberOfLines={1}
              style={{ fontWeight: '600' }}
            >
              {currentActivity.name}
            </AppText>
            <AppText 
              variant="caption" 
              color="secondary"
              numberOfLines={1}
            >
              {formatValue(currentActivity.hourlyValue)} • {remainingMinutes} min remaining
            </AppText>
          </Stack>
        </Stack>
        
        {/* Stop Button */}
        <TouchableOpacity
          style={currentActivityStyles.stopButton}
          onPress={onStopActivity}
          activeOpacity={0.8}
        >
          <AppText 
            variant="caption" 
            style={{ 
              color: Colors.error[700], 
              fontWeight: '600'
            }}
          >
            Stop
          </AppText>
        </TouchableOpacity>
      </Stack>
    </Stack>
  );
});

CurrentActivityBar.displayName = 'CurrentActivityBar';

const currentActivityStyles = {
  container: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: SemanticColors.surface.primary,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.primary,
    padding: Spacing.lg,
    ...Shadows.large,
  } as ViewStyle,
  
  pulseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary[500],
  } as ViewStyle,
  
  stopButton: {
    backgroundColor: Colors.error[100],
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  } as ViewStyle,
};