import { Notification, useNotificationStore } from 'src/stores/notifications';

type Timeout = ReturnType<typeof setTimeout>;

export function registerNotificationEvents(
    notification: Notification,
    container: HTMLDivElement,
    body: HTMLDivElement,
    progress: HTMLDivElement,
    progressWrapper: HTMLDivElement,
    progressLine: HTMLDivElement,
    close: HTMLDivElement
) {
    const duration = notification.duration;
    let expiresAt = Date.now() + duration;

    // Вытаскивание нотификации из-за краёв экрана
    requestAnimationFrame(() => {
        body.style.left = '-20px';
        const bodyRects = body.getBoundingClientRect();
        container.style.height = `${bodyRects.height + 10}px`;
        progressWrapper.style.transition = `width ${(duration / 1000).toFixed(1)}s linear`;
        progressWrapper.style.width = '0';
    });

    // Закрытие нотификации и уделаение из стора
    let removeFromStoreTimeout: Timeout | null = null;
    function closeNotification() {
        if (removeFromStoreTimeout != null) {
            return;
        }

        body.style.left = '100%';
        container.style.height = '0';
        removeFromStoreTimeout = setTimeout(() => {
            useNotificationStore.getState().delete(notification.id);
            removeFromStoreTimeout = null;
        }, 1000);
    }

    // Дефолтное закрытие по истечении времени
    // const progressRect = progress.getBoundingClientRect();
    // progressLine.style.width = `${progressRect.width}px`;
    let closeTimeout: Timeout | null = null;
    startCloseTimeout(duration);

    function startCloseTimeout(duration: number) {
        closeTimeout = setTimeout(() => {
            closeNotification();
        }, duration);
    }

    function stopCloseTimeout() {
        if (closeTimeout != null) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }
    }

    function onMouseEnter() {
        let timeLeft = expiresAt - Date.now();
        if (timeLeft <= 0) {
            timeLeft = 0;
        }

        stopCloseTimeout();
        progressWrapper.style.width = `${((timeLeft / duration) * 100).toFixed(1)}%`;
        progressWrapper.style.transition = `width ${(timeLeft / 1000).toFixed(1)}s linear`;

        body.addEventListener('mouseleave', onMouseLeave);

        function onMouseLeave() {
            startCloseTimeout(timeLeft);
            expiresAt = Date.now() + timeLeft;
            progressWrapper.style.width = '0';

            body.removeEventListener('mouseleave', onMouseLeave);
        }
    }

    // Назначение обработчиков
    close.addEventListener('click', closeNotification);
    body.addEventListener('mouseenter', onMouseEnter);

    return () => {
        close.removeEventListener('click', closeNotification);
        body.removeEventListener('mouseenter', onMouseEnter);

        if (closeTimeout != null) {
            clearTimeout(closeTimeout);
        }
        if (removeFromStoreTimeout != null) {
            clearTimeout(removeFromStoreTimeout);
        }
    };
}
