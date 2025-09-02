import React from 'react';
import { View } from 'react-native';
import { Activity } from '../../types';
import { AppText } from '../ui';

interface ActivityCardProps {
  activity: Activity;
  value: number;
  styles: any; // Activity styles from getActivityValueStyles
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  value,
  styles
}) => {
  const formattedValue = value.toLocaleString();
  const { icon } = styles.iconStyle;

  return (
    <View style={[styles.cardStyle, styles.backgroundTint]}>
      <View style={cardStyles.content}>
        <AppText 
          variant="bodyRegular" 
          style={cardStyles.activityTitle}
        >
          {icon} {activity.name}
        </AppText>
        <AppText 
          variant="caption" 
          style={cardStyles.activityValue}
        >
          ₹{formattedValue}/hr
        </AppText>
      </View>
      
      {/* Value tier badge */}
      <View style={[cardStyles.badge, styles.badgeStyle]}>
        <AppText 
          variant="caption" 
          style={[
            cardStyles.badgeText, 
            { color: styles.badgeStyle.color }
          ]}
        >
          {styles.level}
        </AppText>
      </View>
    </View>
  );
};

const cardStyles = {
  content: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  
  activityTitle: {
    fontWeight: '600' as const,
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
  },
  
  activityValue: {
    fontSize: 12,
    fontWeight: '700' as const,
    opacity: 0.8,
    lineHeight: 14,
  },
  
  badge: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center' as const,
  },
  
  badgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  }
};