import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ─── Configuration ───────────────────────────────────────
const NOTIFICATION_CONFIG = {
  KEYS: {
    PERMISSION_GRANTED: 'notifications_permission_granted',
    LAST_WEEKLY_SCHEDULED: 'notifications_last_weekly_scheduled',
    STREAK_COUNT: 'notifications_streak_count',
    LAST_DREAM_DATE: 'notifications_last_dream_date',
  },
  /** Days of inactivity before sending a nudge */
  INACTIVITY_DAYS: 3,
};

// ─── Safe expo-notifications import ──────────────────────
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch {
  // expo-notifications not available
}

// ─── Permission helpers ──────────────────────────────────

/**
 * Request notification permissions. Returns true if granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications) {
    console.log('[Notifications] expo-notifications not available');
    return false;
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') {
      await AsyncStorage.setItem(NOTIFICATION_CONFIG.KEYS.PERMISSION_GRANTED, 'true');
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';
    await AsyncStorage.setItem(NOTIFICATION_CONFIG.KEYS.PERMISSION_GRANTED, String(granted));
    return granted;
  } catch (e) {
    console.error('[Notifications] Permission request failed:', e);
    return false;
  }
}

/**
 * Check if notifications are permitted (from cache, no OS prompt).
 */
export async function hasNotificationPermission(): Promise<boolean> {
  const cached = await AsyncStorage.getItem(NOTIFICATION_CONFIG.KEYS.PERMISSION_GRANTED);
  return cached === 'true';
}

// ─── Weekly streak nudge ─────────────────────────────────

const WEEKLY_NUDGE_MESSAGES = [
  {
    title: 'Your dreams miss you',
    body: 'You haven\'t logged a dream in a few days. Even a quick note keeps the habit alive.',
  },
  {
    title: 'Keep your streak going',
    body: 'Dream recall improves with consistency. Take 30 seconds to log last night\'s dream.',
  },
  {
    title: 'Your journal is waiting',
    body: 'The best lucid dreamers journal regularly. Open Droplett and capture tonight\'s dream.',
  },
  {
    title: 'Don\'t let your dreams fade',
    body: 'Studies show dream recall drops without regular journaling. Quick — what did you dream?',
  },
];

/**
 * Schedule a weekly streak nudge notification.
 * Fires after 3 days of inactivity, then weekly.
 */
export async function scheduleWeeklyStreakNudge(): Promise<void> {
  if (!Notifications) return;

  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) return;

  try {
    // Cancel any existing weekly nudge
    await cancelWeeklyStreakNudge();

    // Pick a random message
    const message = WEEKLY_NUDGE_MESSAGES[Math.floor(Math.random() * WEEKLY_NUDGE_MESSAGES.length)];

    // Schedule for 3 days from now (inactivity threshold)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        sound: 'default',
        data: { type: 'streak_nudge' },
      },
      trigger: {
        type: 'timeInterval',
        seconds: NOTIFICATION_CONFIG.INACTIVITY_DAYS * 24 * 60 * 60,
        repeats: false,
      },
    });

    await AsyncStorage.setItem(
      NOTIFICATION_CONFIG.KEYS.LAST_WEEKLY_SCHEDULED,
      String(Date.now())
    );
  } catch (e) {
    console.error('[Notifications] Failed to schedule weekly nudge:', e);
  }
}

/**
 * Cancel any pending weekly streak nudge notifications.
 */
export async function cancelWeeklyStreakNudge(): Promise<void> {
  if (!Notifications) return;

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content?.data?.type === 'streak_nudge') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (e) {
    console.error('[Notifications] Failed to cancel weekly nudge:', e);
  }
}

/**
 * Call this after a dream is saved to reset the inactivity timer.
 * Reschedules the nudge for another 3 days from now.
 */
export async function onDreamSaved(): Promise<void> {
  await AsyncStorage.setItem(
    NOTIFICATION_CONFIG.KEYS.LAST_DREAM_DATE,
    new Date().toISOString().slice(0, 10)
  );

  // Reschedule: pushes the nudge forward since user is active
  await scheduleWeeklyStreakNudge();
}

/**
 * Initialize notification system on app start.
 * Sets up channels (Android) and reschedules nudges if needed.
 */
export async function initializeNotifications(): Promise<void> {
  if (!Notifications) return;

  try {
    // Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('streak-nudge', {
        name: 'Dream Reminders',
        importance: Notifications.AndroidImportance?.DEFAULT ?? 3,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C4A265',
      });
    }

    // Check if we need to reschedule
    const hasPermission = await hasNotificationPermission();
    if (hasPermission) {
      const lastScheduled = await AsyncStorage.getItem(
        NOTIFICATION_CONFIG.KEYS.LAST_WEEKLY_SCHEDULED
      );

      // If never scheduled or older than 7 days, reschedule
      if (!lastScheduled) {
        await scheduleWeeklyStreakNudge();
      } else {
        const daysSince = (Date.now() - parseInt(lastScheduled, 10)) / (1000 * 60 * 60 * 24);
        if (daysSince > 7) {
          await scheduleWeeklyStreakNudge();
        }
      }
    }
  } catch (e) {
    console.error('[Notifications] Initialization failed:', e);
  }
}
