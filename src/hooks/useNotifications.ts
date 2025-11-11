import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export interface NotificationSchedule {
  id: string;
  title: string;
  scheduledTime: Date;
}

export const useNotifications = () => {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializeNotifications();
    }
  }, []);

  const initializeNotifications = async () => {
    try {
      // Request permission
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        console.warn('Notification permission not granted');
      }

      // Listen for notification actions
      await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        const action = notification.actionId;
        const notificationId = notification.notification.id;

        if (action === 'mark-done') {
          handleMarkDone(notificationId.toString());
        } else if (action === 'snooze') {
          handleSnooze(notificationId.toString());
        }
      });
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const checkNotificationsEnabled = async (): Promise<boolean> => {
    const { value } = await Preferences.get({ key: 'notificationsEnabled' });
    return value !== 'false'; // Default to true
  };

  const scheduleNotification = async (
    itemId: string,
    title: string,
    scheduledTime: Date
  ): Promise<void> => {
    try {
      const enabled = await checkNotificationsEnabled();
      if (!enabled) return;

      // Calculate notification time (10 minutes before)
      const notifyTime = new Date(scheduledTime.getTime() - 10 * 60 * 1000);
      
      // Don't schedule if notify time is in the past
      if (notifyTime <= new Date()) return;

      const notificationId = parseInt(itemId.replace(/\D/g, '').slice(0, 9)) || Math.floor(Math.random() * 1000000);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notificationId,
            title: `Upcoming Task: ${title}`,
            body: 'Starts in 10 mins. Get ready 🌿',
            schedule: { at: notifyTime },
            sound: 'calm_notification.wav',
            actionTypeId: 'TASK_ACTIONS',
            extra: { itemId },
          },
        ],
      });

      // Store notification mapping
      await storeNotificationMapping(itemId, notificationId);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const cancelNotification = async (itemId: string): Promise<void> => {
    try {
      const notificationId = await getNotificationId(itemId);
      if (notificationId) {
        await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
        await removeNotificationMapping(itemId);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  const rescheduleAllNotifications = async (items: NotificationSchedule[]): Promise<void> => {
    try {
      // Cancel all existing notifications
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map(n => ({ id: n.id })),
        });
      }

      // Reschedule all future notifications
      for (const item of items) {
        await scheduleNotification(item.id, item.title, item.scheduledTime);
      }
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
    }
  };

  const handleMarkDone = async (itemId: string) => {
    // This will be handled by the parent component
    window.dispatchEvent(new CustomEvent('notification-mark-done', { detail: itemId }));
  };

  const handleSnooze = async (itemId: string) => {
    // Reschedule for 5 minutes from now
    window.dispatchEvent(new CustomEvent('notification-snooze', { detail: itemId }));
  };

  return {
    scheduleNotification,
    cancelNotification,
    rescheduleAllNotifications,
    checkNotificationsEnabled,
  };
};

// Helper functions for storing notification mappings
const storeNotificationMapping = async (itemId: string, notificationId: number) => {
  const { value } = await Preferences.get({ key: 'notificationMappings' });
  const mappings = value ? JSON.parse(value) : {};
  mappings[itemId] = notificationId;
  await Preferences.set({
    key: 'notificationMappings',
    value: JSON.stringify(mappings),
  });
};

const getNotificationId = async (itemId: string): Promise<number | null> => {
  const { value } = await Preferences.get({ key: 'notificationMappings' });
  if (!value) return null;
  const mappings = JSON.parse(value);
  return mappings[itemId] || null;
};

const removeNotificationMapping = async (itemId: string) => {
  const { value } = await Preferences.get({ key: 'notificationMappings' });
  if (!value) return;
  const mappings = JSON.parse(value);
  delete mappings[itemId];
  await Preferences.set({
    key: 'notificationMappings',
    value: JSON.stringify(mappings),
  });
};
