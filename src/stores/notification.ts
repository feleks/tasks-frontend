import { ReactFragment } from 'react';
import { create } from 'zustand';

type NotificationID = number;

type NotificationType = 'error' | 'warning' | 'success' | 'info';

type NotificationMessage = ReactFragment | string;

export interface Notification {
    id: NotificationID;
    type: NotificationType;
    message: NotificationMessage;
    duration: number;
}

interface NotificationStore {
    lastID: NotificationID;
    notifications: Notification[];

    show(type: NotificationType, message: NotificationMessage, duration?: number): void;
    delete(id: NotificationID): void;
}

const defaultNotificationDuration = 5000;

export const useNotificationStore = create<NotificationStore>()((set) => ({
    lastID: 0,
    notifications: [],
    show(type, message, duration = defaultNotificationDuration) {
        set((state) => {
            const id = state.lastID + 1;
            const notification: Notification = {
                id,
                type,
                message,
                duration
            };
            const newNotifications = [...state.notifications, notification];

            return {
                lastID: id,
                notifications: newNotifications
            };
        });
    },
    delete(id) {
        set((state) => {
            const notifications = state.notifications.filter((notification) => {
                return notification.id !== id;
            });

            return {
                notifications
            };
        });
    }
}));
