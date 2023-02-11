import { faCheck, faExclamation, faInfo, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import * as notificationStore from 'src/stores/notifications';
import './Notification.scss';
import { registerNotificationEvents } from './notifications';

interface Props {
    notification: notificationStore.Notification;
}

export function Notification(props: Props) {
    const { notification } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const progressWrapperRef = useRef<HTMLDivElement>(null);
    const progressLineRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLDivElement>(null);

    let iconFragment: JSX.Element | null = null;
    switch (notification.type) {
        case 'error':
            iconFragment = <FontAwesomeIcon icon={faExclamation} />;
            break;
        case 'warning':
            iconFragment = <FontAwesomeIcon icon={faExclamation} />;
            break;
        case 'success':
            iconFragment = <FontAwesomeIcon icon={faCheck} />;
            break;
        case 'info':
            iconFragment = <FontAwesomeIcon icon={faInfo} />;
            break;
    }

    useEffect(() => {
        if (
            containerRef.current == null ||
            bodyRef.current == null ||
            progressRef.current == null ||
            progressWrapperRef.current == null ||
            progressLineRef.current == null ||
            closeRef.current == null
        ) {
            throw new Error(`One of divs for notification ${notification.id} is not presented as ref`);
        }

        return registerNotificationEvents(
            notification,
            containerRef.current,
            bodyRef.current,
            progressRef.current,
            progressWrapperRef.current,
            progressLineRef.current,
            closeRef.current
        );
    }, []);

    return (
        <div ref={containerRef} className={classNames('component-notification', notification.type)}>
            <div ref={bodyRef} className={classNames('component-notification-body', 'segment')}>
                <div className="component-notification-body-icon">{iconFragment}</div>
                <div className="component-notification-body-message">{notification.message}</div>
                <div ref={progressRef} className="component-notification-body-progress">
                    <div ref={progressWrapperRef} className="component-notification-body-progress-wrapper">
                        <div ref={progressLineRef} className="component-notification-body-progress-line"></div>
                    </div>
                </div>
                <div ref={closeRef} className="component-notification-body-close">
                    <FontAwesomeIcon icon={faXmark} />
                </div>
            </div>
        </div>
    );
}
