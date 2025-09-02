import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SemanticColors, Spacing } from '../../styles/designSystem';
import { AppText } from '../ui';

interface EmptySlotCardProps {
  showIcon?: boolean;
  showText?: boolean;
}

export const EmptySlotCard: React.FC<EmptySlotCardProps> = ({
  showIcon = true,
  showText = true
}) => {
  return (
    <View style={styles.container}>
      {showIcon && (
        <Ionicons 
          name="add" 
          size={20} 
          color={SemanticColors.text.tertiary} 
          style={[styles.icon, showText && styles.iconWithText]}
        />
      )}
      {showText && (
        <AppText 
          variant="bodyRegular" 
          color="tertiary" 
          style={styles.text}
        >
          Add Activity
        </AppText>
      )}
    </View>
  );
};

const styles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 1,
    minHeight: 60,
  },
  
  icon: {
    // Base icon style
  },
  
  iconWithText: {
    marginRight: Spacing.sm,
  },
  
  text: {
    fontWeight: '500' as const,
    fontSize: 14,
  }
};