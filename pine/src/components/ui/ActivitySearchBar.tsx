import React, { memo, useState } from 'react';
import { View, TextInput, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  SemanticColors, 
  Spacing, 
  BorderRadius, 
  Typography 
} from '../../styles/designSystem';

export interface ActivitySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export const ActivitySearchBar: React.FC<ActivitySearchBarProps> = memo(({
  value,
  onChangeText,
  placeholder = "Search activities...",
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={[searchStyles.container, style]}>
      <View style={[
        searchStyles.inputContainer,
        isFocused && searchStyles.inputContainerFocused
      ]}>
        <Ionicons 
          name="search" 
          size={16} 
          color={SemanticColors.text.tertiary}
          style={searchStyles.searchIcon}
        />
        
        <TextInput
          style={searchStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={SemanticColors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {value.length > 0 && (
          <TouchableOpacity 
            onPress={handleClear}
            style={searchStyles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons 
              name="close-circle" 
              size={16} 
              color={SemanticColors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

ActivitySearchBar.displayName = 'ActivitySearchBar';

const searchStyles = {
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  } as ViewStyle,
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SemanticColors.surface.secondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: SemanticColors.border.primary,
    paddingHorizontal: Spacing.md,
  } as ViewStyle,
  
  inputContainerFocused: {
    borderColor: SemanticColors.border.focus,
    backgroundColor: SemanticColors.surface.primary,
  } as ViewStyle,
  
  searchIcon: {
    marginRight: Spacing.sm,
  } as ViewStyle,
  
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    ...Typography.bodyRegular,
    color: SemanticColors.text.primary,
  } as TextStyle,
  
  clearButton: {
    padding: 4,
    marginLeft: Spacing.sm,
  } as ViewStyle,
};