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

    push(type: NotificationType, message: NotificationMessage, duration?: number): void;
    delete(id: NotificationID): void;
}

const defaultNotificationDuration = 5000;

export const useNotificationStore = create<NotificationStore>()((set) => ({
    lastID: 0,
    notifications: [],
    push(type, message, duration = defaultNotificationDuration) {
        set((state) => {
            const id = state.lastID + 1;
            const notification: Notification = {
                id,
                type,
                message,
                duration
            };
            const newNotifications = [...state.notifications, notification];

            console.log('pushing notification:', newNotifications);

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

useNotificationStore.getState().push(
    'error',
    `
asd
ads
asd
asdasd
asd
sda
das
das
asd
asd
asd
asd
asd
asd
asd
asd

asdasd
asdsd
aasd
asd

asd
sda
asd
`
);
useNotificationStore.getState().push('warning', 'warning');
useNotificationStore.getState().push('success', 'success');
useNotificationStore.getState().push('info', 'info');
