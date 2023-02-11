import { ReactFragment } from 'react';
import { create } from 'zustand';

type NotificationID = number;

type NotificationType = 'error' | 'warning' | 'success' | 'info';

type NotificationMessage = ReactFragment | string;

export interface Notification {
    id: NotificationID;
    type: NotificationType;
    message: NotificationMessage;
    expireAt: number;
}

interface NotificationStore {
    lastID: NotificationID;
    notifications: Notification[];

    push(type: NotificationType, message: NotificationMessage, expire?: number): void;
    delete(id: NotificationID): void;
}

const defaultNotificationExpire = 5000;

export const useNotificationStore = create<NotificationStore>()((set) => ({
    lastID: 0,
    notifications: [],
    push(type, message, expire = defaultNotificationExpire) {
        set((state) => {
            const id = state.lastID + 1;
            const notification: Notification = {
                id,
                type,
                message,
                expireAt: Date.now() + expire
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
