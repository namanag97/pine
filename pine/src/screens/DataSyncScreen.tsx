import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { 
  Gradients, 
  Colors, 
  Spacing 
} from '../styles/designSystem';
import { 
  Container, 
  Stack, 
  AppText, 
  Button,
  Card,
  SafeAreaContainer
} from '../components/ui';
import { dataSyncService } from '../services/DataSyncService';
import { storageService } from '../services/StorageService';

interface DataSyncScreenProps {
  navigation: any;
}

const DataSyncScreen: React.FC<DataSyncScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    lastSyncTime: Date | null;
    localLogs: number;
    localSummaries: number;
    pendingSync: boolean;
  } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    loadSyncStatus();
    testConnection();
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await dataSyncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const testConnection = async () => {
    try {
      const result = await dataSyncService.testConnection();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({ connected: false, error: error.message });
    }
  };

  const handleSyncToSupabase = async () => {
    setLoading(true);
    try {
      const result = await dataSyncService.syncAllLocalData();
      
      if (result.success) {
        Alert.alert(
          'Sync Successful! ✅',
          `Synced ${result.synced} items to Supabase`
        );
      } else {
        Alert.alert(
          'Sync Issues ⚠️',
          `Synced ${result.synced} items, but ${result.errors.length} errors occurred:\n\n${result.errors.slice(0, 3).join('\n')}`
        );
      }
      
      await loadSyncStatus();
    } catch (error) {
      Alert.alert('Sync Failed ❌', `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFromSupabase = async () => {
    setLoading(true);
    try {
      const result = await dataSyncService.fetchAndMergeFromSupabase();
      
      if (result.success) {
        if (result.fetched > 0) {
          Alert.alert(
            'Data Restored! 📥',
            `Fetched ${result.fetched} missing items from Supabase`
          );
        } else {
          Alert.alert(
            'No New Data 👍',
            'Your local data is already up to date'
          );
        }
      } else {
        Alert.alert(
          'Fetch Failed ❌',
          `Error: ${result.errors.join(', ')}`
        );
      }
      
      await loadSyncStatus();
    } catch (error) {
      Alert.alert('Fetch Failed ❌', `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStorageStats = async () => {
    try {
      const stats = await storageService.getStorageStats();
      const exportData = await storageService.exportAllData();
      
      Alert.alert(
        'Storage Statistics 📊',
        `Total Activity Logs: ${stats.totalActivityLogs}
Total Summaries: ${stats.totalDailySummaries}
Storage Size: ${(stats.totalStorageSize / 1024).toFixed(2)} KB
Device ID: ${exportData.deviceId.substring(0, 20)}...
Oldest Log: ${stats.oldestLogDate ? new Date(stats.oldestLogDate).toLocaleDateString() : 'None'}
Newest Log: ${stats.newestLogDate ? new Date(stats.newestLogDate).toLocaleDateString() : 'None'}`
      );
    } catch (error) {
      Alert.alert('Error', `Failed to load stats: ${error.message}`);
    }
  };

  return (
    <LinearGradient colors={Gradients.skyGradient} style={styles.container}>
      <SafeAreaContainer>
        <Container padding="lg">
          <Stack spacing="lg">
            {/* Header */}
            <Stack direction="horizontal" align="center" justify="space-between">
              <Button
                variant="ghost"
                onPress={() => navigation.goBack()}
              >
                ← Back
              </Button>
              <AppText variant="heading2" color="primary">
                🔄 Data Sync
              </AppText>
              <View style={{ width: 60 }} />
            </Stack>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Stack spacing="lg">
                {/* Connection Status */}
                <Card variant="outlined" padding="medium">
                  <Stack spacing="sm">
                    <AppText variant="label" color="secondary">
                      SUPABASE CONNECTION
                    </AppText>
                    {connectionStatus ? (
                      <Stack spacing="xs">
                        <AppText 
                          variant="bodyLarge" 
                          color={connectionStatus.connected ? "success" : "error"}
                        >
                          {connectionStatus.connected ? "✅ Connected" : "❌ Disconnected"}
                        </AppText>
                        {connectionStatus.error && (
                          <AppText variant="bodySmall" color="error">
                            {connectionStatus.error}
                          </AppText>
                        )}
                      </Stack>
                    ) : (
                      <AppText variant="bodyLarge" color="secondary">
                        Testing connection...
                      </AppText>
                    )}
                  </Stack>
                </Card>

                {/* Sync Status */}
                {syncStatus && (
                  <Card variant="outlined" padding="medium">
                    <Stack spacing="sm">
                      <AppText variant="label" color="secondary">
                        SYNC STATUS
                      </AppText>
                      <Stack spacing="xs">
                        <Stack direction="horizontal" justify="space-between">
                          <AppText variant="bodyRegular">Local Activity Logs</AppText>
                          <AppText variant="numerical" color="primary">
                            {syncStatus.localLogs}
                          </AppText>
                        </Stack>
                        <Stack direction="horizontal" justify="space-between">
                          <AppText variant="bodyRegular">Local Summaries</AppText>
                          <AppText variant="numerical" color="primary">
                            {syncStatus.localSummaries}
                          </AppText>
                        </Stack>
                        <Stack direction="horizontal" justify="space-between">
                          <AppText variant="bodyRegular">Last Sync</AppText>
                          <AppText variant="bodySmall" color="secondary">
                            {syncStatus.lastSyncTime 
                              ? syncStatus.lastSyncTime.toLocaleString()
                              : 'Never'
                            }
                          </AppText>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                )}

                {/* Actions */}
                <Stack spacing="md">
                  <AppText variant="label" color="secondary">
                    DATA SYNC ACTIONS
                  </AppText>
                  
                  <Button
                    variant="primary"
                    onPress={handleSyncToSupabase}
                    disabled={loading || !connectionStatus?.connected}
                  >
                    {loading ? 'Syncing...' : '📤 Sync Local Data to Cloud'}
                  </Button>

                  <Button
                    variant="secondary"
                    onPress={handleFetchFromSupabase}
                    disabled={loading || !connectionStatus?.connected}
                  >
                    {loading ? 'Fetching...' : '📥 Fetch Missing Data from Cloud'}
                  </Button>

                  <Button
                    variant="ghost"
                    onPress={testConnection}
                    disabled={loading}
                  >
                    🔍 Test Connection
                  </Button>

                  <Button
                    variant="ghost"
                    onPress={handleViewStorageStats}
                  >
                    📊 View Storage Stats
                  </Button>
                </Stack>

                {/* Help Text */}
                <Card variant="elevated" padding="medium">
                  <Stack spacing="sm">
                    <AppText variant="label" color="secondary">
                      💡 TROUBLESHOOTING
                    </AppText>
                    <AppText variant="bodySmall" color="tertiary">
                      • If connection fails, check your internet connection
                    </AppText>
                    <AppText variant="bodySmall" color="tertiary">
                      • Use "Sync to Cloud" to backup your local data
                    </AppText>
                    <AppText variant="bodySmall" color="tertiary">
                      • Use "Fetch from Cloud" to restore missing data
                    </AppText>
                    <AppText variant="bodySmall" color="tertiary">
                      • Data is stored locally first, then synced to cloud
                    </AppText>
                  </Stack>
                </Card>
              </Stack>
            </ScrollView>
          </Stack>
        </Container>
      </SafeAreaContainer>
    </LinearGradient>
  );
};

const styles = {
  container: {
    flex: 1,
  },
};

export default DataSyncScreen;