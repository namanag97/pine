import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Activity, TimeSlot, DailyLog, NotificationSettings, AppError } from '../types';
import { format } from 'date-fns';

// State Interfaces
export interface AppState {
  // Core domain state
  activities: Activity[];
  timeSlots: Record<string, TimeSlot[]>; // Keyed by date (YYYY-MM-DD)
  dailyLogs: Record<string, DailyLog>;   // Keyed by date (YYYY-MM-DD)
  
  // UI state
  currentDate: string; // YYYY-MM-DD format
  selectedTimeSlot: TimeSlot | null;
  loading: Record<string, boolean>;
  
  // Sync state
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  pendingOperations: Operation[];
  
  // Settings
  notificationSettings: NotificationSettings;
  
  // Error state
  errors: Record<string, AppError>;
}

export interface SyncStatus {
  connected: boolean;
  syncing: boolean;
  lastError: string | null;
  pendingCount: number;
}

export interface Operation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'activity' | 'timeSlot' | 'dailyLog';
  entityId: string;
  data: any;
  timestamp: Date;
  retries: number;
}

// Actions Interface
export interface AppActions {
  // Activity actions
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  
  // TimeSlot actions
  setTimeSlots: (date: string, timeSlots: TimeSlot[]) => void;
  updateTimeSlot: (date: string, slotIndex: number, updates: Partial<TimeSlot>) => void;
  logActivity: (date: string, slotIndex: number, activity: Activity | null) => void;
  
  // Daily log actions
  updateDailyLog: (date: string, dailyLog: Partial<DailyLog>) => void;
  calculateDailyLog: (date: string) => void;
  
  // UI actions
  setCurrentDate: (date: string) => void;
  setSelectedTimeSlot: (timeSlot: TimeSlot | null) => void;
  setLoading: (key: string, loading: boolean) => void;
  
  // Sync actions
  setSyncStatus: (status: Partial<SyncStatus>) => void;
  addPendingOperation: (operation: Operation) => void;
  removePendingOperation: (operationId: string) => void;
  setLastSyncTime: (time: Date) => void;
  
  // Settings actions
  setNotificationSettings: (settings: NotificationSettings) => void;
  
  // Error actions
  setError: (key: string, error: AppError) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  
  // Computed selectors
  getCurrentTimeSlots: () => TimeSlot[];
  getCurrentDailyLog: () => DailyLog | null;
  getTodaysValue: () => number;
  getActivityCount: (date?: string) => number;
  getPendingOperationsCount: () => number;
}

// Initial State
const initialState: AppState = {
  activities: [],
  timeSlots: {},
  dailyLogs: {},
  currentDate: format(new Date(), 'yyyy-MM-dd'),
  selectedTimeSlot: null,
  loading: {},
  syncStatus: {
    connected: false,
    syncing: false,
    lastError: null,
    pendingCount: 0,
  },
  lastSyncTime: null,
  pendingOperations: [],
  notificationSettings: {
    enabled: true,
    startTime: '06:00',
    endTime: '22:00',
    intervalMinutes: 30,
    skipFilledSlots: true,
  },
  errors: {},
};

// Create Store with Middleware
export const useAppStore = create<AppState & AppActions>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // Activity actions
        setActivities: (activities) => set((state) => {
          state.activities = activities;
        }),
        
        addActivity: (activity) => set((state) => {
          state.activities.push(activity);
          // Add pending operation for sync
          state.pendingOperations.push({
            id: `add_activity_${Date.now()}`,
            type: 'CREATE',
            entity: 'activity',
            entityId: activity.id,
            data: activity,
            timestamp: new Date(),
            retries: 0,
          });
        }),
        
        updateActivity: (id, updates) => set((state) => {
          const index = state.activities.findIndex(a => a.id === id);
          if (index !== -1) {
            Object.assign(state.activities[index], updates);
            // Add pending operation for sync
            state.pendingOperations.push({
              id: `update_activity_${Date.now()}`,
              type: 'UPDATE',
              entity: 'activity',
              entityId: id,
              data: updates,
              timestamp: new Date(),
              retries: 0,
            });
          }
        }),
        
        deleteActivity: (id) => set((state) => {
          state.activities = state.activities.filter(a => a.id !== id);
          // Add pending operation for sync
          state.pendingOperations.push({
            id: `delete_activity_${Date.now()}`,
            type: 'DELETE',
            entity: 'activity',
            entityId: id,
            data: null,
            timestamp: new Date(),
            retries: 0,
          });
        }),
        
        // TimeSlot actions
        setTimeSlots: (date, timeSlots) => set((state) => {
          state.timeSlots[date] = timeSlots;
        }),
        
        updateTimeSlot: (date, slotIndex, updates) => set((state) => {
          if (state.timeSlots[date] && state.timeSlots[date][slotIndex]) {
            Object.assign(state.timeSlots[date][slotIndex], updates);
            // Recalculate daily log
            get().calculateDailyLog(date);
          }
        }),
        
        logActivity: (date, slotIndex, activity) => set((state) => {
          if (state.timeSlots[date] && state.timeSlots[date][slotIndex]) {
            const timeSlot = state.timeSlots[date][slotIndex];
            timeSlot.activity = activity;
            timeSlot.value = activity ? activity.blockValue : 0;
            timeSlot.isLogged = activity !== null;
            
            // Add pending operation for sync
            state.pendingOperations.push({
              id: `log_activity_${Date.now()}`,
              type: activity ? 'CREATE' : 'DELETE',
              entity: 'timeSlot',
              entityId: timeSlot.id,
              data: {
                timeSlot,
                activity,
                date,
                slotIndex,
              },
              timestamp: new Date(),
              retries: 0,
            });
            
            // Recalculate daily log
            get().calculateDailyLog(date);
          }
        }),
        
        // Daily log actions
        updateDailyLog: (date, dailyLog) => set((state) => {
          if (state.dailyLogs[date]) {
            Object.assign(state.dailyLogs[date], dailyLog);
          } else {
            state.dailyLogs[date] = {
              date,
              timeSlots: [],
              totalValue: 0,
              activityCount: 0,
              completedSlots: 0,
              ...dailyLog,
            } as DailyLog;
          }
        }),
        
        calculateDailyLog: (date) => set((state) => {
          const timeSlots = state.timeSlots[date] || [];
          const totalValue = timeSlots.reduce((sum, slot) => sum + slot.value, 0);
          const activityCount = timeSlots.filter(slot => slot.activity).length;
          const completedSlots = timeSlots.filter(slot => slot.isLogged).length;
          
          state.dailyLogs[date] = {
            date,
            timeSlots,
            totalValue,
            activityCount,
            completedSlots,
          };
        }),
        
        // UI actions
        setCurrentDate: (date) => set((state) => {
          state.currentDate = date;
        }),
        
        setSelectedTimeSlot: (timeSlot) => set((state) => {
          state.selectedTimeSlot = timeSlot;
        }),
        
        setLoading: (key, loading) => set((state) => {
          if (loading) {
            state.loading[key] = true;
          } else {
            delete state.loading[key];
          }
        }),
        
        // Sync actions
        setSyncStatus: (status) => set((state) => {
          Object.assign(state.syncStatus, status);
        }),
        
        addPendingOperation: (operation) => set((state) => {
          state.pendingOperations.push(operation);
          state.syncStatus.pendingCount = state.pendingOperations.length;
        }),
        
        removePendingOperation: (operationId) => set((state) => {
          state.pendingOperations = state.pendingOperations.filter(op => op.id !== operationId);
          state.syncStatus.pendingCount = state.pendingOperations.length;
        }),
        
        setLastSyncTime: (time) => set((state) => {
          state.lastSyncTime = time;
        }),
        
        // Settings actions
        setNotificationSettings: (settings) => set((state) => {
          state.notificationSettings = settings;
        }),
        
        // Error actions
        setError: (key, error) => set((state) => {
          state.errors[key] = error;
        }),
        
        clearError: (key) => set((state) => {
          delete state.errors[key];
        }),
        
        clearAllErrors: () => set((state) => {
          state.errors = {};
        }),
        
        // Computed selectors
        getCurrentTimeSlots: () => {
          const state = get();
          return state.timeSlots[state.currentDate] || [];
        },
        
        getCurrentDailyLog: () => {
          const state = get();
          return state.dailyLogs[state.currentDate] || null;
        },
        
        getTodaysValue: () => {
          const state = get();
          const dailyLog = state.dailyLogs[state.currentDate];
          return dailyLog?.totalValue || 0;
        },
        
        getActivityCount: (date) => {
          const state = get();
          const targetDate = date || state.currentDate;
          const dailyLog = state.dailyLogs[targetDate];
          return dailyLog?.activityCount || 0;
        },
        
        getPendingOperationsCount: () => {
          const state = get();
          return state.pendingOperations.length;
        },
      })),
      {
        name: 'pine-app-store',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          // Only persist essential data
          activities: state.activities,
          timeSlots: state.timeSlots,
          dailyLogs: state.dailyLogs,
          notificationSettings: state.notificationSettings,
          lastSyncTime: state.lastSyncTime,
          pendingOperations: state.pendingOperations,
        }),
      }
    )
  )
);

// Selectors for specific use cases
export const selectActivitiesByCategory = (category?: string) => (state: AppState & AppActions) => {
  if (!category) return state.activities;
  return state.activities.filter(activity => activity.category === category);
};

export const selectTimeSlotsByDate = (date: string) => (state: AppState & AppActions) => {
  return state.timeSlots[date] || [];
};

export const selectCurrentTimeSlot = () => (state: AppState & AppActions) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const slotIndex = Math.floor((currentHour * 60 + currentMinute) / 30);
  
  const timeSlots = state.getCurrentTimeSlots();
  return timeSlots[slotIndex] || null;
};

export const selectSyncState = () => (state: AppState & AppActions) => ({
  status: state.syncStatus,
  pendingCount: state.pendingOperations.length,
  lastSyncTime: state.lastSyncTime,
  hasErrors: Object.keys(state.errors).length > 0,
});

// Hooks for common use cases
export const useActivities = () => useAppStore(state => state.activities);
export const useCurrentTimeSlots = () => useAppStore(state => state.getCurrentTimeSlots());
export const useCurrentDailyLog = () => useAppStore(state => state.getCurrentDailyLog());
export const useSyncState = () => useAppStore(selectSyncState());
export const useLoading = (key: string) => useAppStore(state => state.loading[key] || false);
export const useErrors = () => useAppStore(state => state.errors);