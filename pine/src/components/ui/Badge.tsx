import React from 'react';
import { View, ViewStyle, TextStyle } from 'react-native';
import { 
  SemanticColors, 
  BorderRadius, 
  Spacing,
  Colors,
  getActivityValueColor,
  getActivityLevelInfo
} from '../../styles/designSystem';
import { AppText } from './Typography';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'medium',
  style,
  textStyle,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    let colorStyle: ViewStyle = {};
    switch (variant) {
      case 'primary':
        colorStyle = {
          backgroundColor: Colors.primary[100],
          borderColor: Colors.primary[200],
        };
        break;
      case 'secondary':
        colorStyle = {
          backgroundColor: SemanticColors.surface.secondary,
          borderColor: SemanticColors.border.primary,
        };
        break;
      case 'success':
        colorStyle = {
          backgroundColor: Colors.success[100],
          borderColor: Colors.success[200],
        };
        break;
      case 'warning':
        colorStyle = {
          backgroundColor: Colors.warning[100],
          borderColor: Colors.warning[200],
        };
        break;
      case 'error':
        colorStyle = {
          backgroundColor: Colors.error[100],
          borderColor: Colors.error[200],
        };
        break;
      default: // neutral
        colorStyle = {
          backgroundColor: SemanticColors.surface.secondary,
          borderColor: SemanticColors.border.primary,
        };
        break;
    }

    let sizeStyle: ViewStyle = {};
    switch (size) {
      case 'small':
        sizeStyle = {
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
          borderRadius: BorderRadius.sm,
        };
        break;
      case 'large':
        sizeStyle = {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          borderRadius: BorderRadius.md,
        };
        break;
      default: // medium
        sizeStyle = {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: BorderRadius.sm,
        };
        break;
    }

    return {
      borderWidth: 1,
      alignSelf: 'flex-start',
      ...colorStyle,
      ...sizeStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    let colorStyle: TextStyle = {};
    switch (variant) {
      case 'primary':
        colorStyle = { color: Colors.primary[700] };
        break;
      case 'secondary':
        colorStyle = { color: SemanticColors.text.secondary };
        break;
      case 'success':
        colorStyle = { color: Colors.success[700] };
        break;
      case 'warning':
        colorStyle = { color: Colors.warning[800] };
        break;
      case 'error':
        colorStyle = { color: Colors.error[700] };
        break;
      default: // neutral
        colorStyle = { color: SemanticColors.text.secondary };
        break;
    }

    const sizeTextStyle = size === 'small' ? 'caption' : 'label';

    return {
      ...colorStyle,
      ...textStyle,
    };
  };

  return (
    <View style={getBadgeStyle()}>
      <AppText variant={size === 'small' ? 'caption' : 'label'} style={getTextStyle()}>
        {children}
      </AppText>
    </View>
  );
};

// Specialized Badge Components
export interface ActivityLevelBadgeProps {
  value: number;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  style?: ViewStyle;
}

export const ActivityLevelBadge: React.FC<ActivityLevelBadgeProps> = ({
  value,
  size = 'medium',
  showIcon = true,
  style,
}) => {
  const levelInfo = getActivityLevelInfo(value);
  
  const customStyle: ViewStyle = {
    backgroundColor: levelInfo.color + '20', // 20% opacity
    borderColor: levelInfo.color,
    ...style,
  };

  const textStyle: TextStyle = {
    color: levelInfo.color,
    fontWeight: '600',
  };

  return (
    <Badge size={size} style={customStyle} textStyle={textStyle}>
      {showIcon && `${levelInfo.icon} `}{levelInfo.level}
    </Badge>
  );
};

export interface StatusBadgeProps {
  status: 'completed' | 'pending' | 'in_progress' | 'failed';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  style,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          variant: 'success' as const,
          text: 'Completed',
          icon: '✓',
        };
      case 'pending':
        return {
          variant: 'warning' as const,
          text: 'Pending',
          icon: '⏳',
        };
      case 'in_progress':
        return {
          variant: 'primary' as const,
          text: 'In Progress',
          icon: '🔄',
        };
      case 'failed':
        return {
          variant: 'error' as const,
          text: 'Failed',
          icon: '✗',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} size={size} style={style}>
      {config.icon} {config.text}
    </Badge>
  );
};

export interface CountBadgeProps {
  count: number;
  maxCount?: number;
  style?: ViewStyle;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  maxCount = 99,
  style,
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  const customStyle: ViewStyle = {
    backgroundColor: Colors.error[500],
    borderColor: Colors.error[500],
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    ...style,
  };

  const textStyle: TextStyle = {
    color: SemanticColors.text.inverse,
    fontSize: 10,
    fontWeight: 'bold',
  };

  return (
    <Badge size="small" style={customStyle} textStyle={textStyle}>
      {displayCount}
    </Badge>
  );
};