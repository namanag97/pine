import React, { useState } from 'react';
import { 
  TextInput, 
  View, 
  TouchableOpacity, 
  ViewStyle, 
  TextInputProps,
  TextStyle 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  ComponentStyles, 
  SemanticColors, 
  Typography,
  Spacing,
  BorderRadius
} from '../../styles/designSystem';
import { AppText } from './Typography';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  disabled?: boolean;
  variant?: 'default' | 'search';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  disabled = false,
  variant = 'default',
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle = ComponentStyles.input.default;
    const focusedStyle = isFocused ? ComponentStyles.input.focused : {};
    const errorStyle = error ? ComponentStyles.input.error : {};
    
    const disabledStyle: ViewStyle = disabled ? {
      backgroundColor: SemanticColors.surface.disabled,
      borderColor: SemanticColors.border.disabled,
    } : {};

    const variantStyle: ViewStyle = variant === 'search' ? {
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.lg,
    } : {};

    const iconPadding: ViewStyle = {
      paddingLeft: leftIcon ? Spacing['5xl'] : Spacing.md,
      paddingRight: rightIcon ? Spacing['5xl'] : Spacing.md,
    };

    return {
      ...baseStyle,
      ...focusedStyle,
      ...errorStyle,
      ...disabledStyle,
      ...variantStyle,
      ...iconPadding,
      ...inputStyle,
    };
  };

  const getTextStyle = (): TextStyle => {
    return {
      ...Typography.bodyRegular,
      color: disabled ? SemanticColors.text.disabled : SemanticColors.text.primary,
      flex: 1,
      paddingVertical: 0, // Remove default padding
    };
  };

  return (
    <View style={containerStyle}>
      {label && (
        <AppText 
          variant="label" 
          color="secondary" 
          style={{ marginBottom: Spacing.xs }}
        >
          {label}
        </AppText>
      )}
      
      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <View style={{
            position: 'absolute',
            left: Spacing.md,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            zIndex: 1,
          }}>
            <Ionicons 
              name={leftIcon} 
              size={20} 
              color={SemanticColors.text.tertiary} 
            />
          </View>
        )}
        
        <TextInput
          style={getTextStyle()}
          placeholderTextColor={SemanticColors.text.tertiary}
          selectionColor={SemanticColors.border.focus}
          editable={!disabled}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
          {...textInputProps}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: Spacing.md,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              paddingHorizontal: Spacing.xs,
            }}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <Ionicons 
              name={rightIcon} 
              size={20} 
              color={SemanticColors.text.tertiary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <AppText 
          variant="caption" 
          color="error" 
          style={{ marginTop: Spacing.xs }}
        >
          {error}
        </AppText>
      )}
      
      {hint && !error && (
        <AppText 
          variant="caption" 
          color="tertiary" 
          style={{ marginTop: Spacing.xs }}
        >
          {hint}
        </AppText>
      )}
    </View>
  );
};

// Specialized Input Components
export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'variant'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onClear,
  showClearButton = true,
  value,
  ...props
}) => {
  const handleClear = () => {
    onClear?.();
  };

  return (
    <Input
      variant="search"
      leftIcon="search-outline"
      rightIcon={showClearButton && value ? "close-circle" : undefined}
      onRightIconPress={handleClear}
      value={value}
      {...props}
    />
  );
};