import React from 'react';
import { View, ViewStyle, TouchableOpacity, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius, Shadows, StatsTokens } from '../../styles/designSystem';
import { AppText } from './Typography';

export interface StatsHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onExport?: () => void;
  onShare?: (shareData?: any) => void;
  showBackButton?: boolean;
  showExportButton?: boolean;
  showShareButton?: boolean;
  shareData?: any;
  style?: ViewStyle;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  title = 'Stats',
  subtitle = 'Analytics Dashboard',
  onBack,
  onExport,
  onShare,
  showBackButton = true,
  showExportButton = true,
  showShareButton = true,
  shareData,
  style,
}) => {
  const handleExport = async () => {
    try {
      if (onExport) {
        onExport();
      } else {
        // Default export behavior
        Alert.alert(
          'Export Data',
          'Choose export format',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'CSV', onPress: () => exportAsCSV() },
            { text: 'JSON', onPress: () => exportAsJSON() },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export data. Please try again.');
    }
  };

  const exportAsCSV = () => {
    // Placeholder for CSV export
    Alert.alert('Export', 'CSV export functionality will be implemented');
  };

  const exportAsJSON = () => {
    // Placeholder for JSON export
    Alert.alert('Export', 'JSON export functionality will be implemented');
  };

  const handleShare = async () => {
    try {
      if (onShare) {
        onShare(shareData);
      } else {
        // Default share behavior
        const defaultShareData = shareData || {
          title: 'My Pine Stats',
          message: `Check out my productivity stats from Pine! 📊\n\nGenerated with Pine - Time Value Optimization`,
          subject: 'Pine Stats Report'
        };

        // Use React Native's built-in Share API
        const result = await Share.share({
          message: `${defaultShareData.title}\n\n${defaultShareData.message}`,
          title: defaultShareData.title
        });

        if (result.action === Share.sharedAction) {
          console.log('Stats shared successfully');
        }
      }
    } catch (error) {
      if (error.message !== 'User did not share') {
        Alert.alert('Share Failed', 'Unable to share stats. Please try again.');
      }
    }
  };

  const showToast = (message: string) => {
    Alert.alert('Info', message);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Left section */}
      <View style={styles.leftSection}>
        {showBackButton && onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={Colors.primary[500]} 
            />
          </TouchableOpacity>
        )}
        
        <View style={styles.titleContainer}>
          <AppText variant="heading2" style={styles.titleText}>
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="caption" style={styles.subtitleText}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>

      {/* Right section */}
      <View style={styles.rightSection}>
        {showExportButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleExport}
            accessibilityLabel="Export data"
            accessibilityRole="button"
          >
            <Ionicons 
              name="download-outline" 
              size={20} 
              color={Colors.neutral[600]} 
            />
          </TouchableOpacity>
        )}

        {showShareButton && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            accessibilityLabel="Share stats"
            accessibilityRole="button"
          >
            <Ionicons 
              name="share-outline" 
              size={20} 
              color={Colors.neutral[600]} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    minHeight: StatsTokens.layout.headerHeight,
    ...Shadows.soft,
  } as ViewStyle,

  leftSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  } as ViewStyle,

  backButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[50],
    marginRight: Spacing.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: 40,
    height: 40,
  } as ViewStyle,

  titleContainer: {
    flex: 1,
  } as ViewStyle,

  titleText: {
    fontWeight: '700' as const,
    color: Colors.neutral[900],
    marginBottom: 2,
  } as ViewStyle,

  subtitleText: {
    color: Colors.neutral[500],
    fontSize: 12,
  } as ViewStyle,

  rightSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.sm,
  } as ViewStyle,

  actionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[50],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  } as ViewStyle,
};