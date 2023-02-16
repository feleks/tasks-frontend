import React from 'react';
import { useNotificationStore } from 'src/stores/notification';
import { Notification } from './notification/Notification';
import './Notifications.scss';


export function Notifications() {
    const notifications = useNotificationStore((state) => state.notifications);

    const notificationsFragment = notifications.map((notification) => {
        return <Notification key={notification.id} notification={notification} />;
    });

    return <div className="component-notifications">{notificationsFragment}</div>;
}
