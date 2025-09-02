import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import DashboardScreen from '../screens/DashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import ActivitySelectionScreen from '../screens/ActivitySelectionScreen';
import ActivityLogScreen from '../screens/ActivityLogScreen';
import DataSyncScreen from '../screens/DataSyncScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = React.forwardRef<any, {}>((_, ref) => {
  return (
    <NavigationContainer ref={ref}>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        {/* Main Dashboard Screen */}
        <Stack.Screen 
          name="Main" 
          component={DashboardScreen}
        />
        
        {/* Settings Screen */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            title: 'Settings',
            headerStyle: { backgroundColor: '#3B82F6' },
            headerTintColor: 'white',
            headerTitleStyle: { fontWeight: 'bold' },
            presentation: 'modal',
          }}
        />
        
        {/* Stats Screen */}
        <Stack.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            headerShown: false,
            title: 'Statistics',
            presentation: 'modal',
          }}
        />
        
        {/* Activity Selection Modal */}
        <Stack.Screen
          name="ActivitySelection"
          component={ActivitySelectionScreen}
          options={{
            title: 'Select Activity',
            presentation: 'modal',
            headerShown: false,
          }}
        />
        
        {/* Activity Log Screen */}
        <Stack.Screen
          name="ActivityLog"
          component={ActivityLogScreen}
          options={{
            title: 'Activity History',
            presentation: 'modal',
            headerShown: false,
          }}
        />
        
        {/* Data Sync Screen */}
        <Stack.Screen
          name="DataSync"
          component={DataSyncScreen}
          options={{
            title: 'Data Sync',
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
});

export default AppNavigator;