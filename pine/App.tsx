import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainerRef } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { notificationService } from './src/services/NotificationService';
import { timeSlotService } from './src/services/TimeSlotService';
import { RootStackParamList } from './src/types';

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    // Set up notification response handler
    notificationService.setupNotificationResponseHandler((timeSlot) => {
      // Navigate to activity selection when notification is tapped
      if (navigationRef.current?.isReady()) {
        navigationRef.current.navigate('ActivitySelection', {
          timeSlot,
          onActivitySelected: () => {
            // Navigate back to dashboard after selecting activity
            navigationRef.current?.navigate('Main');
          },
        });
      }
    });
  }, []);

  return (
    <>
      <AppNavigator ref={navigationRef} />
      <StatusBar style="light" />
    </>
  );
}
