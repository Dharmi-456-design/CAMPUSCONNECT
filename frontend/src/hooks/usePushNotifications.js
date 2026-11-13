import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import axiosClient from '../api/axiosClient';

// Configure how notifications appear when the app is in the FOREGROUND
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (e) {
  console.warn('[PushNotif] Handler configuration skipped:', e.message);
}

/**
 * Hook that:
 * 1. Requests notification permissions safely
 * 2. Gets the Expo Push Token if available and registers it with backend
 * 3. Listens for foreground notifications without throwing
 * 4. Listens for notification taps and navigates to the right tab
 *
 * @param {function} onNavigateTab - AppNavigator's setActiveTab function
 */
export default function usePushNotifications(onNavigateTab) {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Notifications are not supported on web — skip entirely
    if (Platform.OS === 'web') return;

    let isMounted = true;

    registerForPushNotificationsAsync()
      .then((token) => {
        if (token && isMounted) {
          // Save token to our backend so the server can push to this device
          axiosClient
            .post('/users/push-token', { expoPushToken: token })
            .catch((err) =>
              console.warn('[PushNotif] Failed to register token on server:', err.message)
            );
        }
      })
      .catch((err) => {
        console.warn('[PushNotif] Registration error handled:', err.message);
      });

    // Listener: notification received while app is OPEN (foreground)
    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log('[PushNotif] Foreground notification:', notification?.request?.content?.title);
        }
      );
    } catch (err) {
      console.warn('[PushNotif] Add listener skipped:', err.message);
    }

    // Listener: user TAPPED a notification (foreground or background)
    try {
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response?.notification?.request?.content?.data;
          if (data?.tab && onNavigateTab) {
            onNavigateTab(data.tab);
          }
        }
      );
    } catch (err) {
      console.warn('[PushNotif] Add response listener skipped:', err.message);
    }

    return () => {
      isMounted = false;
      try {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(notificationListener.current);
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(responseListener.current);
        }
      } catch (err) {
        // Safe unmount cleanup
      }
    };
  }, [onNavigateTab]);
}

/**
 * Request notification permissions and return the Expo Push Token safely.
 * Returns null if permission is denied, on web, or in Expo Go SDK 51 without EAS projectId.
 */
async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return null;

  try {
    // Create Android notification channel (required for Android 8+)
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('campusconnect', {
          name: 'CampusConnect',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#16A36A',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      } catch (channelErr) {
        console.warn('[PushNotif] Could not set channel:', channelErr.message);
      }
    }

    // Check existing permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[PushNotif] Permission not granted — notifications disabled');
      return null;
    }

    // Get the Expo push token safely
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      console.log('[PushNotif] Token registered:', tokenData?.data);
      return tokenData?.data || null;
    } catch (tokenErr) {
      console.warn('[PushNotif] Push token not available (Expo Go / EAS Project ID missing):', tokenErr.message);
      return null;
    }
  } catch (err) {
    console.warn('[PushNotif] registerForPushNotificationsAsync failed safely:', err.message);
    return null;
  }
}
