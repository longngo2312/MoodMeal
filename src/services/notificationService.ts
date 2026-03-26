import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFS_KEY = '@moodmeal_notification_prefs';

export interface NotificationPrefs {
  enabled: boolean;
  mealReminders: boolean;
  moodCheckIn: boolean;
  mealTimes: { hour: number; minute: number }[];
  moodCheckInTime: { hour: number; minute: number };
}

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  mealReminders: true,
  moodCheckIn: true,
  mealTimes: [
    { hour: 8, minute: 0 },   // Breakfast
    { hour: 12, minute: 30 },  // Lunch
    { hour: 18, minute: 30 },  // Dinner
  ],
  moodCheckInTime: { hour: 20, minute: 0 }, // Evening mood check-in
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      return false; // Notifications don't work on simulators
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'MoodMeal Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return true;
  },

  async getPrefs(): Promise<NotificationPrefs> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_PREFS;
  },

  async savePrefs(prefs: NotificationPrefs): Promise<void> {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    await this.scheduleAll(prefs);
  },

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async scheduleAll(prefs?: NotificationPrefs): Promise<void> {
    await this.cancelAll();

    const p = prefs || (await this.getPrefs());
    if (!p.enabled) return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Schedule meal reminders
    if (p.mealReminders) {
      const mealLabels = ['Breakfast', 'Lunch', 'Dinner'];
      for (let i = 0; i < p.mealTimes.length; i++) {
        const time = p.mealTimes[i];
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${mealLabels[i] || 'Meal'} Time!`,
            body: `Don't forget to log your ${(mealLabels[i] || 'meal').toLowerCase()} in MoodMeal.`,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: time.hour,
            minute: time.minute,
          },
        });
      }
    }

    // Schedule mood check-in
    if (p.moodCheckIn) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Mood Check-In',
          body: 'How are you feeling today? Take a moment to log your mood.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: p.moodCheckInTime.hour,
          minute: p.moodCheckInTime.minute,
        },
      });
    }
  },

  async initialize(): Promise<void> {
    const prefs = await this.getPrefs();
    if (prefs.enabled) {
      await this.scheduleAll(prefs);
    }
  },
};
