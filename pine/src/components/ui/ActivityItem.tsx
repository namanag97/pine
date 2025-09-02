import React, { memo } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { Activity } from '../../types';
import { SemanticColors, Spacing } from '../../styles/designSystem';
import { AppText } from './Typography';
import { Stack } from './Layout';
import { ValueBadge } from './ValueBadge';

export interface ActivityItemProps {
  activity: Activity;
  onPress: (activity: Activity) => void;
  style?: ViewStyle;
}

export const ActivityItem: React.FC<ActivityItemProps> = memo(({
  activity,
  onPress,
  style,
}) => {
  const handlePress = () => {
    onPress(activity);
  };

  return (
    <TouchableOpacity
      style={[itemStyles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Stack direction="horizontal" align="center" justify="space-between">
        <Stack spacing="xs" style={{ flex: 1, marginRight: Spacing.md }}>
          <AppText 
            variant="bodyRegular" 
            color="primary" 
            numberOfLines={2}
            style={{ fontWeight: '500' }}
          >
            {activity.name}
          </AppText>
          
          {/* Optional: Show category if needed */}
          {activity.category && (
            <AppText 
              variant="caption" 
              color="tertiary"
              numberOfLines={1}
            >
              {activity.category}
            </AppText>
          )}
        </Stack>
        
        <ValueBadge 
          value={activity.blockValue} 
          size="medium" 
        />
      </Stack>
    </TouchableOpacity>
  );
});

ActivityItem.displayName = 'ActivityItem';

const itemStyles = {
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.primary,
    backgroundColor: SemanticColors.surface.primary,
  } as ViewStyle,
};