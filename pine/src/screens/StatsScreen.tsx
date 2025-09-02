import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, Alert, Animated, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { 
  Gradients, 
  SemanticColors, 
  Colors, 
  Spacing, 
  StatsTokens,
  EnhancedAnimation
} from '../styles/designSystem';
import { storageService } from '../services/StorageService';
import { statsService, PeriodStats } from '../services/StatsService';
import { formatIndianNumber } from '../utils/indianNumberFormat';
import { 
  Container, 
  Stack, 
  AppText, 
  Button,
  Card,
  StatsHeader,
  TrendsChart,
  ValueTierBreakdown,
  KeyInsightsGrid,
  EfficiencyMeter,
  TrendsChartDataPoint,
  InsightData,
  SafeAreaContainer
} from '../components/ui';

interface StatsScreenProps {
  navigation: any;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [stats, setStats] = useState<PeriodStats | null>(null);
  const [trends, setTrends] = useState<TrendsChartDataPoint[]>([]);
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    loadAllStats();
  }, [selectedPeriod]);

  useEffect(() => {
    if (!loading) {
      // Staggered entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: EnhancedAnimation.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: EnhancedAnimation.duration.normal,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [loading, fadeAnim, slideAnim]);

  const loadAllStats = useCallback(async () => {
    try {
      setLoading(true);
      const allLogs = await storageService.getAllActivityLogs();
      
      // Calculate comprehensive stats
      const periodStats = await statsService.calculatePeriodStats(allLogs, selectedPeriod);
      setStats(periodStats);

      // Calculate trends data
      const trendsData = await statsService.calculateTrendsData(allLogs, selectedPeriod === 'today' ? 'week' : 'month');
      setTrends(selectedPeriod === 'today' ? trendsData.daily : trendsData.monthly);

      // Generate insights
      const insightsData = await statsService.generateInsights(periodStats, selectedPeriod);
      setInsights(insightsData);
      
    } catch (error) {
      console.error('Failed to load stats:', error);
      Alert.alert('Error', 'Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  const getPeriodLabel = useMemo(() => {
    switch (selectedPeriod) {
      case 'week': return 'THIS WEEK';
      case 'month': return 'THIS MONTH';
      default: return 'TODAY';
    }
  }, [selectedPeriod]);

  const handleExport = useCallback(async () => {
    if (!stats) return;
    
    try {
      const csvData = statsService.exportAsCSV(stats, getPeriodLabel);
      // Implementation would handle actual file sharing
      Alert.alert('Export Ready', 'CSV data prepared for export');
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export data. Please try again.');
    }
  }, [stats, getPeriodLabel]);

  const handleShare = useCallback(async () => {
    if (!stats) return;
    
    try {
      // Create shareable text content
      const shareText = `Pine Stats - ${getPeriodLabel}

My productivity stats:
• ${stats.totalHours}h logged
• ₹${formatIndianNumber(stats.totalValue)} earned
• ${stats.efficiency}% efficiency

Generated with Pine 📊`;

      // Use React Native's built-in Share API
      const result = await Share.share({
        message: shareText,
        title: 'Pine Stats'
      });

      if (result.action === Share.sharedAction) {
        // Content was successfully shared
        console.log('Stats shared successfully');
      }
    } catch (error) {
      Alert.alert('Share Failed', 'Unable to share stats. Please try again.');
    }
  }, [stats, getPeriodLabel]);

  if (loading) {
    return (
      <LinearGradient colors={Gradients.skyGradient} style={styles.container}>
        <SafeAreaContainer>
          <Container padding="xl">
            <AppText variant="bodyLarge" color="secondary" align="center">
              Loading analytics...
            </AppText>
          </Container>
        </SafeAreaContainer>
      </LinearGradient>
    );
  }

  if (!stats) {
    return (
      <LinearGradient colors={Gradients.skyGradient} style={styles.container}>
        <SafeAreaContainer>
          <Container padding="xl">
            <AppText variant="bodyLarge" color="secondary" align="center">
              No data available for this period
            </AppText>
          </Container>
        </SafeAreaContainer>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={Gradients.skyGradient} style={styles.container}>
      <SafeAreaContainer>
        <Animated.View style={[
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }, 
          styles.content
        ]}>
          {/* Enhanced Header with Export/Share */}
          <StatsHeader
            title="📊 Analytics"
            subtitle={getPeriodLabel}
            onBack={() => navigation.goBack()}
            onExport={handleExport}
            onShare={handleShare}
            shareData={{
              title: `Pine Stats - ${getPeriodLabel}`,
              message: `My productivity: ${stats.totalHours}h, ₹${formatIndianNumber(stats.totalValue)}, ${stats.efficiency}% efficiency 📊`,
            }}
          />

          {/* Period Selector */}
          <Container padding="lg">
            <Stack direction="horizontal" spacing="sm" justify="center">
              {(['today', 'week', 'month'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'primary' : 'ghost'}
                  onPress={() => setSelectedPeriod(period)}
                  style={{ flex: 1 }}
                >
                  {period === 'today' ? 'Today' : period === 'week' ? 'Week' : 'Month'}
                </Button>
              ))}
            </Stack>
          </Container>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Key Insights Grid */}
            <Container padding="lg">
              <KeyInsightsGrid
                insights={insights}
                columns={2}
                spacing={Spacing.md}
              />
            </Container>

            {/* Efficiency Meter */}
            <Container padding="lg">
              <EfficiencyMeter
                percentage={stats.efficiency}
                label="PRODUCTIVITY"
                subtitle={`${stats.totalHours - stats.zeroValueHours} productive hours`}
                animated
              />
            </Container>

            {/* Trends Chart */}
            {trends.length > 0 && (
              <Container padding="lg">
                <Stack spacing="md">
                  <AppText variant="heading3" color="primary">
                    📈 Trends
                  </AppText>
                  <Card variant="elevated" padding="large">
                    <TrendsChart
                      data={trends}
                      height={200}
                      animated
                      showLabels
                      onBarPress={(dataPoint) => {
                        Alert.alert(
                          'Trend Detail',
                          `${dataPoint.label}: ₹${formatIndianNumber(dataPoint.value)}`
                        );
                      }}
                    />
                  </Card>
                </Stack>
              </Container>
            )}

            {/* Value Tier Breakdown */}
            <Container padding="lg">
              <Stack spacing="md">
                <AppText variant="heading3" color="primary">
                  🎯 Value Distribution
                </AppText>
                <ValueTierBreakdown
                  data={stats.valueBreakdown}
                  showEmpty={false}
                  animated
                />
              </Stack>
            </Container>

            {/* Top Activities */}
            {stats.topActivity && (
              <Container padding="lg">
                <Stack spacing="md">
                  <AppText variant="heading3" color="primary">
                    🏆 Top Activities
                  </AppText>
                  
                  {/* Highlighted Top Activity */}
                  <Card variant="elevated" padding="large">
                    <Stack spacing="sm">
                      <AppText variant="label" color="secondary">
                        HIGHEST VALUE
                      </AppText>
                      <Stack direction="horizontal" justify="space-between" align="center">
                        <Stack>
                          <AppText variant="heading4" color="primary" style={{ fontWeight: '700' }}>
                            {stats.topActivity.name}
                          </AppText>
                          <AppText variant="bodySmall" color="secondary">
                            {stats.topActivity.hours} hours • ₹{formatIndianNumber(Math.round(stats.topActivity.value / stats.topActivity.hours))}/hr
                          </AppText>
                        </Stack>
                        <AppText variant="numericalLarge" color="success">
                          ₹{formatIndianNumber(stats.topActivity.value)}
                        </AppText>
                      </Stack>
                    </Stack>
                  </Card>

                  {/* Activity Ranking List */}
                  <Stack spacing="sm">
                    {statsService.generateActivityRanking(stats.activityBreakdown).map((activity) => (
                      <Card key={activity.name} variant="outlined" padding="medium">
                        <Stack direction="horizontal" justify="space-between" align="center">
                          <Stack>
                            <Stack direction="horizontal" align="center" spacing="sm">
                              <AppText variant="bodySmall" color="secondary" style={{ fontWeight: '600' }}>
                                #{activity.rank}
                              </AppText>
                              <AppText variant="bodyLarge" color="primary" style={{ fontWeight: '600' }}>
                                {activity.name}
                              </AppText>
                            </Stack>
                            <AppText variant="bodySmall" color="secondary">
                              {activity.hours}h • {activity.sessions} sessions • ₹{formatIndianNumber(activity.avgSessionValue)}/session
                            </AppText>
                          </Stack>
                          <AppText variant="numerical" color="success">
                            ₹{formatIndianNumber(activity.value)}
                          </AppText>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Container>
            )}

            {/* Period Summary */}
            <Container padding="lg">
              <Card variant="outlined" padding="large">
                <Stack spacing="md">
                  <AppText variant="heading4" color="primary">
                    📋 Period Summary
                  </AppText>
                  <Stack spacing="xs">
                    <Stack direction="horizontal" justify="space-between">
                      <AppText variant="bodyRegular" color="secondary">Total Hours</AppText>
                      <AppText variant="numerical" color="primary">{stats.totalHours}h</AppText>
                    </Stack>
                    <Stack direction="horizontal" justify="space-between">
                      <AppText variant="bodyRegular" color="secondary">Total Value</AppText>
                      <AppText variant="numerical" color="success">₹{formatIndianNumber(stats.totalValue)}</AppText>
                    </Stack>
                    <Stack direction="horizontal" justify="space-between">
                      <AppText variant="bodyRegular" color="secondary">Average Rate</AppText>
                      <AppText variant="numerical" color="primary">₹{formatIndianNumber(Math.round(stats.avgHourlyValue))}/hr</AppText>
                    </Stack>
                    <Stack direction="horizontal" justify="space-between">
                      <AppText variant="bodyRegular" color="secondary">High-Value Hours</AppText>
                      <AppText variant="numerical" color="success">{stats.highValueHours}h</AppText>
                    </Stack>
                    {stats.weeklyGrowth !== 0 && (
                      <Stack direction="horizontal" justify="space-between">
                        <AppText variant="bodyRegular" color="secondary">Weekly Growth</AppText>
                        <AppText 
                          variant="numerical" 
                          color={stats.weeklyGrowth > 0 ? 'success' : 'error'}
                        >
                          {stats.weeklyGrowth > 0 ? '+' : ''}{stats.weeklyGrowth}%
                        </AppText>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Card>
            </Container>

            {/* Bottom Padding */}
            <View style={{ height: Spacing['4xl'] }} />
          </ScrollView>
        </Animated.View>
      </SafeAreaContainer>
    </LinearGradient>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
};

export default StatsScreen;