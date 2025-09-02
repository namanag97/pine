import React from 'react';
import { 
  View, 
  Modal as RNModal, 
  TouchableOpacity, 
  ViewStyle,
  ModalProps as RNModalProps
} from 'react-native';
import { 
  SemanticColors, 
  BorderRadius, 
  Shadows, 
  Spacing 
} from '../../styles/designSystem';
import { AppText } from './Typography';
import { Button } from './Button';
import { Stack } from './Layout';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  animationType?: RNModalProps['animationType'];
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
  size = 'medium',
  style,
  animationType = 'slide',
}) => {
  const getModalWidth = () => {
    switch (size) {
      case 'small': return '70%';
      case 'large': return '95%';
      default: return '80%';
    }
  };

  const getMaxWidth = () => {
    switch (size) {
      case 'small': return 280;
      case 'large': return 500;
      default: return 320;
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={animationType}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={[
          styles.modalContainer, 
          { 
            width: getModalWidth(),
            maxWidth: getMaxWidth(),
          },
          style
        ]}>
          {/* Header */}
          {title && (
            <View style={styles.header}>
              <AppText variant="heading3" color="primary" align="center">
                {title}
              </AppText>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>

          {/* Actions */}
          {(primaryAction || secondaryAction) && (
            <View style={styles.actions}>
              <Stack direction="horizontal" spacing="md" justify="space-between">
                {secondaryAction && (
                  <Button 
                    variant="ghost" 
                    onPress={secondaryAction.onPress}
                    style={{ flex: 1 }}
                  >
                    {secondaryAction.label}
                  </Button>
                )}
                {primaryAction && (
                  <Button 
                    variant={primaryAction.variant || 'primary'} 
                    onPress={primaryAction.onPress}
                    style={{ flex: 1 }}
                  >
                    {primaryAction.label}
                  </Button>
                )}
              </Stack>
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: Spacing.lg,
  },
  overlayTouchable: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: SemanticColors.surface.primary,
    borderRadius: BorderRadius.large,
    ...Shadows.large,
    maxHeight: 600,
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: SemanticColors.border.primary,
  },
  content: {
    padding: Spacing.xl,
  },
  actions: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border.primary,
  },
};