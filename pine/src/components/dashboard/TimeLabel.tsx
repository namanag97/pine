import React from 'react';
import { View } from 'react-native';
import { Timeline, SemanticColors } from '../../styles/designSystem';
import { AppText } from '../ui';

interface TimeLabelProps {
  time: string;
  isActive?: boolean;
  isCurrent?: boolean;
}

export const TimeLabel: React.FC<TimeLabelProps> = ({
  time,
  isActive = false,
  isCurrent = false
}) => {
  const textColor = isCurrent 
    ? SemanticColors.text.link 
    : isActive 
      ? SemanticColors.text.secondary 
      : SemanticColors.text.tertiary;

  return (
    <View style={[
      styles.container,
      isCurrent && styles.currentContainer
    ]}>
      <AppText 
        variant="caption" 
        style={[
          styles.timeText,
          { color: textColor },
          isCurrent && styles.currentText
        ]}
      >
        {time}
      </AppText>
      {isCurrent && <View style={styles.currentIndicator} />}
    </View>
  );
};

const styles = {
  container: {
    width: Timeline.timeLabel.width,
    alignItems: 'flex-end' as const,
    justifyContent: 'center' as const,
    marginRight: Timeline.timeLabel.marginRight,
    position: 'relative' as const,
  },
  
  currentContainer: {
    backgroundColor: SemanticColors.surface.selected,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  
  timeText: {
    fontSize: Timeline.timeLabel.fontSize,
    fontWeight: Timeline.timeLabel.fontWeight,
    textAlign: Timeline.timeLabel.textAlign,
  },
  
  currentText: {
    fontWeight: '600' as const,
  },
  
  currentIndicator: {
    position: 'absolute' as const,
    right: -12,
    top: 12, // Changed from '50%' to specific pixel value
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SemanticColors.text.link,
  }
};