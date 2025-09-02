import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subDays, subWeeks, subMonths, eachDayOfInterval, parseISO } from 'date-fns';
import { StoredActivityLog } from '../types';
import { getActivityLevelInfo, getActivityTierName } from '../styles/designSystem';
import { ValueTierData } from '../components/ui/ValueTierBreakdown';
import { TrendsChartDataPoint } from '../components/ui/TrendsChart';
import { InsightData } from '../components/ui/KeyInsightsGrid';
import { formatIndianNumber } from '../utils/indianNumberFormat';

export interface PeriodStats {
  totalHours: number;
  totalValue: number;
  avgHourlyValue: number;
  efficiency: number;
  highValueHours: number;
  zeroValueHours: number;
  topActivity: { name: string; hours: number; value: number } | null;
  activityBreakdown: { [key: string]: { hours: number; value: number; count: number } };
  valueBreakdown: ValueTierData[];
  weeklyGrowth: number;
  monthlyGrowth: number;
}

export interface TrendsData {
  daily: TrendsChartDataPoint[];
  weekly: TrendsChartDataPoint[];
  monthly: TrendsChartDataPoint[];
}

class StatsService {
  /**
   * Calculate comprehensive stats for a given period
   */
  async calculatePeriodStats(
    logs: StoredActivityLog[],
    period: 'today' | 'week' | 'month',
    selectedDate: Date = new Date()
  ): Promise<PeriodStats> {
    const { startDate, endDate } = this.getPeriodDates(period, selectedDate);
    
    // Filter logs for the period
    const periodLogs = logs.filter(log => {
      const logDate = parseISO(log.timeSlotStart);
      return logDate >= startDate && logDate <= endDate;
    });

    // Basic calculations
    const totalHours = periodLogs.length * 0.5; // Each log is 30 minutes
    const totalValue = periodLogs.reduce((sum, log) => sum + log.blockValue, 0);
    const avgHourlyValue = totalHours > 0 ? totalValue / totalHours : 0;
    const highValueHours = periodLogs.filter(log => log.blockValue >= 10000).length * 0.5;
    const zeroValueHours = periodLogs.filter(log => log.blockValue === 0).length * 0.5;
    
    // Efficiency calculation (percentage of time spent productively)
    const productiveHours = periodLogs.filter(log => log.blockValue > 0).length * 0.5;
    const efficiency = totalHours > 0 ? Math.round((productiveHours / totalHours) * 100) : 0;

    // Activity breakdown
    const activityBreakdown: { [key: string]: { hours: number; value: number; count: number } } = {};
    periodLogs.forEach(log => {
      if (!activityBreakdown[log.activityName]) {
        activityBreakdown[log.activityName] = { hours: 0, value: 0, count: 0 };
      }
      activityBreakdown[log.activityName].hours += 0.5;
      activityBreakdown[log.activityName].value += log.blockValue;
      activityBreakdown[log.activityName].count += 1;
    });

    // Top activity by value
    const topActivity = Object.entries(activityBreakdown)
      .sort(([,a], [,b]) => b.value - a.value)[0];

    // Value tier breakdown
    const valueBreakdown = this.calculateValueTierBreakdown(periodLogs);

    // Growth calculations
    const weeklyGrowth = await this.calculateGrowth(logs, selectedDate, 'week');
    const monthlyGrowth = await this.calculateGrowth(logs, selectedDate, 'month');

    return {
      totalHours,
      totalValue,
      avgHourlyValue,
      efficiency,
      highValueHours,
      zeroValueHours,
      topActivity: topActivity ? {
        name: topActivity[0],
        hours: topActivity[1].hours,
        value: topActivity[1].value
      } : null,
      activityBreakdown,
      valueBreakdown,
      weeklyGrowth,
      monthlyGrowth,
    };
  }

  /**
   * Calculate value tier breakdown
   */
  private calculateValueTierBreakdown(logs: StoredActivityLog[]): ValueTierData[] {
    const tierMap: { [key: string]: { hours: number; value: number; count: number } } = {
      ceo: { hours: 0, value: 0, count: 0 },
      executive: { hours: 0, value: 0, count: 0 },
      highValue: { hours: 0, value: 0, count: 0 },
      professional: { hours: 0, value: 0, count: 0 },
      basic: { hours: 0, value: 0, count: 0 },
      lowValue: { hours: 0, value: 0, count: 0 },
      free: { hours: 0, value: 0, count: 0 },
      negative: { hours: 0, value: 0, count: 0 },
    };

    logs.forEach(log => {
      const tier = getActivityTierName(log.hourlyValue || 0) as keyof typeof tierMap;
      if (tierMap[tier]) {
        tierMap[tier].hours += 0.5;
        tierMap[tier].value += log.blockValue;
        tierMap[tier].count += 1;
      }
    });

    return Object.entries(tierMap).map(([tier, data]) => ({
      tier: tier as ValueTierData['tier'],
      hours: data.hours,
      value: data.value,
      activityCount: data.count,
    }));
  }

  /**
   * Calculate trends data for charts
   */
  async calculateTrendsData(logs: StoredActivityLog[], period: 'week' | 'month'): Promise<TrendsData> {
    const today = new Date();
    
    // Weekly trends (last 7 days)
    const weeklyData: TrendsChartDataPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayLogs = logs.filter(log => {
        const logDate = parseISO(log.timeSlotStart);
        return format(logDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });
      
      const value = dayLogs.reduce((sum, log) => sum + log.blockValue, 0);
      weeklyData.push({
        label: format(date, 'EEE'),
        value,
        color: this.getTrendColor(value),
      });
    }

    // Monthly trends (last 4 weeks)
    const monthlyData: TrendsChartDataPoint[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
      
      const weekLogs = logs.filter(log => {
        const logDate = parseISO(log.timeSlotStart);
        return logDate >= weekStart && logDate <= weekEnd;
      });
      
      const value = weekLogs.reduce((sum, log) => sum + log.blockValue, 0);
      monthlyData.push({
        label: `W${i + 1}`,
        value,
        color: this.getTrendColor(value),
      });
    }

    return {
      daily: weeklyData,
      weekly: weeklyData,
      monthly: monthlyData,
    };
  }

  /**
   * Generate key insights data
   */
  async generateInsights(stats: PeriodStats, period: 'today' | 'week' | 'month'): Promise<InsightData[]> {
    const insights: InsightData[] = [
      {
        id: 'avgHourlyRate',
        title: 'Avg Hourly Rate',
        value: Math.round(stats.avgHourlyValue),
        format: 'currency',
        icon: 'cash-outline',
        color: stats.avgHourlyValue >= 1000 ? '#43A047' : '#FF8F00',
        trend: stats.weeklyGrowth > 0 ? 'up' : stats.weeklyGrowth < 0 ? 'down' : 'neutral',
        trendValue: `${Math.abs(Math.round(stats.weeklyGrowth))}%`,
      },
      {
        id: 'productiveHours',
        title: 'Productive Hours',
        value: stats.totalHours - stats.zeroValueHours,
        format: 'time',
        icon: 'time-outline',
        color: '#2196F3',
        subtitle: 'Value-generating time',
      },
      {
        id: 'highValueFocus',
        title: 'High-Value Focus',
        value: stats.totalHours > 0 ? Math.round((stats.highValueHours / stats.totalHours) * 100) : 0,
        format: 'percentage',
        icon: 'star-outline',
        color: '#FFC107',
        subtitle: '₹10K+ activities',
      },
      {
        id: 'periodGrowth',
        title: this.getGrowthLabel(period),
        value: period === 'month' ? stats.monthlyGrowth : stats.weeklyGrowth,
        format: 'percentage',
        icon: 'trending-up',
        color: '#4CAF50',
        trend: stats.weeklyGrowth > 0 ? 'up' : stats.weeklyGrowth < 0 ? 'down' : 'neutral',
        trendValue: 'vs last period',
      },
    ];

    return insights;
  }

  /**
   * Calculate growth percentage compared to previous period
   */
  private async calculateGrowth(logs: StoredActivityLog[], currentDate: Date, period: 'week' | 'month'): Promise<number> {
    const current = this.getPeriodDates(period, currentDate);
    const previous = period === 'week' 
      ? this.getPeriodDates(period, subWeeks(currentDate, 1))
      : this.getPeriodDates(period, subMonths(currentDate, 1));

    const currentLogs = logs.filter(log => {
      const logDate = parseISO(log.timeSlotStart);
      return logDate >= current.startDate && logDate <= current.endDate;
    });

    const previousLogs = logs.filter(log => {
      const logDate = parseISO(log.timeSlotStart);
      return logDate >= previous.startDate && logDate <= previous.endDate;
    });

    const currentValue = currentLogs.reduce((sum, log) => sum + log.blockValue, 0);
    const previousValue = previousLogs.reduce((sum, log) => sum + log.blockValue, 0);

    if (previousValue === 0) return currentValue > 0 ? 100 : 0;
    
    return Math.round(((currentValue - previousValue) / previousValue) * 100);
  }

  /**
   * Get period date ranges
   */
  private getPeriodDates(period: 'today' | 'week' | 'month', date: Date) {
    switch (period) {
      case 'week':
        return {
          startDate: startOfWeek(date, { weekStartsOn: 1 }),
          endDate: endOfWeek(date, { weekStartsOn: 1 }),
        };
      case 'month':
        return {
          startDate: startOfMonth(date),
          endDate: endOfMonth(date),
        };
      default: // today
        return {
          startDate: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          endDate: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
        };
    }
  }

  /**
   * Get color for trend values
   */
  private getTrendColor(value: number): string {
    if (value >= 50000) return '#FDD835'; // Gold
    if (value >= 20000) return '#43A047'; // Green
    if (value >= 5000) return '#2196F3';  // Blue
    if (value >= 1000) return '#FF9800';  // Orange
    return '#9E9E9E'; // Gray
  }

  /**
   * Get growth label based on period
   */
  private getGrowthLabel(period: 'today' | 'week' | 'month'): string {
    switch (period) {
      case 'week':
        return 'Week Growth';
      case 'month':
        return 'Month Growth';
      default:
        return 'Day Growth';
    }
  }

  /**
   * Generate activity ranking data
   */
  generateActivityRanking(activityBreakdown: PeriodStats['activityBreakdown']) {
    return Object.entries(activityBreakdown)
      .sort(([,a], [,b]) => b.value - a.value)
      .slice(0, 5)
      .map(([name, data], index) => ({
        rank: index + 1,
        name,
        hours: data.hours,
        value: data.value,
        sessions: data.count,
        avgSessionValue: data.count > 0 ? Math.round(data.value / data.count) : 0,
      }));
  }

  /**
   * Export stats data as CSV
   */
  exportAsCSV(stats: PeriodStats, period: string): string {
    const csvData = [
      ['Pine Stats Export', ''],
      ['Period', period],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['Metric', 'Value'],
      ['Total Hours', stats.totalHours.toString()],
      ['Total Value', `₹${formatIndianNumber(stats.totalValue)}`],
      ['Average Hourly Rate', `₹${formatIndianNumber(Math.round(stats.avgHourlyValue))}`],
      ['Efficiency', `${stats.efficiency}%`],
      ['High Value Hours', stats.highValueHours.toString()],
      [''],
      ['Value Tier Breakdown', ''],
      ...stats.valueBreakdown.map(tier => [
        getActivityLevelInfo(tier.tier === 'ceo' ? 2000000 : 0).level,
        `${tier.hours}h - ₹${formatIndianNumber(tier.value)}`
      ]),
    ];

    return csvData.map(row => row.join(',')).join('\n');
  }

  /**
   * Export stats data as JSON
   */
  exportAsJSON(stats: PeriodStats, period: string): string {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      period,
      stats,
      appInfo: {
        name: 'Pine - Time Value Optimization',
        version: '1.0.0',
      },
    }, null, 2);
  }
}

// Create and export singleton instance
export const statsService = new StatsService();
export default statsService;