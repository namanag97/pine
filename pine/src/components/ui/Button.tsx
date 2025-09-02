import React, { useMemo, memo } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { 
  ComponentStyles, 
  Typography, 
  SemanticColors, 
  Animation 
} from '../../styles/designSystem';

export interface ButtonProps {
  children: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = memo(({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onPress,
  style,
  textStyle,
  testID,
}) => {
  const buttonStyle = useMemo((): ViewStyle => {
    const baseStyle = ComponentStyles.button[variant];
    
    let sizeStyle: ViewStyle = {};
    switch (size) {
      case 'small':
        sizeStyle = {
          minHeight: 36,
          paddingHorizontal: 12,
          paddingVertical: 8,
        };
        break;
      case 'large':
        sizeStyle = {
          minHeight: 56,
          paddingHorizontal: 24,
          paddingVertical: 16,
        };
        break;
      default: // medium
        sizeStyle = baseStyle;
        break;
    }

    const disabledStyle: ViewStyle = disabled ? {
      backgroundColor: SemanticColors.surface.disabled,
      borderColor: SemanticColors.border.disabled,
      opacity: 0.6,
    } : {};

    return {
      ...baseStyle,
      ...sizeStyle,
      ...disabledStyle,
      ...style,
    };
  }, [variant, size, disabled, style]);

  const computedTextStyle = useMemo((): TextStyle => {
    let baseTextStyle: TextStyle;
    
    switch (size) {
      case 'small':
        baseTextStyle = {
          ...Typography.label,
          fontSize: 12,
        };
        break;
      case 'large':
        baseTextStyle = {
          ...Typography.button,
          fontSize: 18,
        };
        break;
      default: // medium
        baseTextStyle = Typography.button;
        break;
    }

    let colorStyle: TextStyle = {};
    switch (variant) {
      case 'primary':
      case 'danger':
        colorStyle = { color: SemanticColors.text.inverse };
        break;
      case 'secondary':
        colorStyle = { color: SemanticColors.text.link };
        break;
      case 'ghost':
        colorStyle = { color: SemanticColors.text.primary };
        break;
    }

    const disabledTextStyle: TextStyle = disabled ? {
      color: SemanticColors.text.disabled,
    } : {};

    return {
      ...baseTextStyle,
      ...colorStyle,
      ...disabledTextStyle,
      ...textStyle,
    };
  }, [size, variant, disabled, textStyle]);

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      activeOpacity={disabled || loading ? 1 : 0.8}
      disabled={disabled || loading}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'danger' ? SemanticColors.text.inverse : SemanticColors.text.primary} 
        />
      ) : (
        <Text style={computedTextStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  );
});