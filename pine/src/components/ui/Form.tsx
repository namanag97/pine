import React from 'react';
import { 
  View, 
  Switch as RNSwitch, 
  TouchableOpacity, 
  ViewStyle,
  TextStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  SemanticColors, 
  Colors,
  BorderRadius, 
  Spacing 
} from '../../styles/designSystem';
import { AppText } from './Typography';
import { Stack } from './Layout';

// Switch Component
export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'medium',
  color = Colors.primary[500],
}) => {
  const getThumbColor = () => {
    if (disabled) return SemanticColors.text.disabled;
    return value ? color : SemanticColors.surface.primary;
  };

  const getTrackColor = () => {
    if (disabled) return { false: SemanticColors.surface.tertiary, true: SemanticColors.surface.tertiary };
    return { 
      false: SemanticColors.surface.secondary, 
      true: color + '40' // 25% opacity
    };
  };

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={getTrackColor()}
      thumbColor={getThumbColor()}
      style={[
        size === 'small' && { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
        size === 'large' && { transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] },
      ]}
    />
  );
};

// Form Row Component  
export interface FormRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

export const FormRow: React.FC<FormRowProps> = ({
  children,
  style,
  onPress,
  disabled = false,
}) => {
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component
      style={[styles.formRow, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Component>
  );
};

// Setting Item Component
export interface SettingItemProps {
  title: string;
  description?: string;
  value?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  title,
  description,
  value,
  rightElement,
  onPress,
  disabled = false,
  style,
}) => {
  return (
    <FormRow onPress={onPress} disabled={disabled} style={style}>
      <Stack direction="horizontal" align="center" spacing="md" justify="space-between">
        <View style={styles.settingContent}>
          <AppText 
            variant="bodyLarge" 
            color={disabled ? "disabled" : "primary"}
            style={styles.settingTitle}
          >
            {title}
          </AppText>
          {description && (
            <AppText 
              variant="bodySmall" 
              color={disabled ? "disabled" : "secondary"}
              style={styles.settingDescription}
            >
              {description}
            </AppText>
          )}
          {value && (
            <AppText 
              variant="bodyLarge" 
              color={disabled ? "disabled" : "link"}
              style={styles.settingValue}
            >
              {value}
            </AppText>
          )}
        </View>
        {rightElement && (
          <View style={styles.rightElement}>
            {rightElement}
          </View>
        )}
        {onPress && !rightElement && (
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={disabled ? SemanticColors.text.disabled : SemanticColors.text.tertiary} 
          />
        )}
      </Stack>
    </FormRow>
  );
};

// Action Button Component (for settings actions)
export interface ActionButtonProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress: () => void;
  variant?: 'default' | 'warning' | 'danger';
  style?: ViewStyle;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  icon,
  iconColor,
  onPress,
  variant = 'default',
  style,
}) => {
  const getTextColor = () => {
    switch (variant) {
      case 'warning': return Colors.warning[600];
      case 'danger': return Colors.error[600];
      default: return SemanticColors.text.link;
    }
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    return getTextColor();
  };

  return (
    <FormRow onPress={onPress} style={style}>
      <Stack direction="horizontal" align="center" spacing="md" justify="space-between">
        <Stack direction="horizontal" align="center" spacing="md">
          {icon && (
            <Ionicons name={icon} size={20} color={getIconColor()} />
          )}
          <AppText 
            variant="bodyLarge" 
            style={{
              ...styles.actionButtonText,
              color: getTextColor()
            }}
          >
            {title}
          </AppText>
        </Stack>
        <Ionicons name="chevron-forward" size={20} color={SemanticColors.text.tertiary} />
      </Stack>
    </FormRow>
  );
};

// Section Component
export interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  children,
  style,
}) => {
  return (
    <View style={[styles.section, style]}>
      <AppText 
        variant="label" 
        color="secondary" 
        style={styles.sectionTitle}
      >
        {title.toUpperCase()}
      </AppText>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

const styles = {
  formRow: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.primary,
    backgroundColor: SemanticColors.surface.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: '500' as const,
  },
  settingDescription: {
    marginTop: 2,
  },
  settingValue: {
    marginTop: 2,
    fontWeight: '500' as const,
  },
  rightElement: {
    marginLeft: Spacing.md,
  },
  actionButtonText: {
    fontWeight: '500' as const,
  },
  section: {
    backgroundColor: SemanticColors.surface.primary,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
  },
  sectionContent: {
    // Children will have their own padding
  },
};