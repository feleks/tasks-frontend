import { useAuthStore } from 'src/stores/auth';
import { useNotificationStore } from 'src/stores/notification';
import { ApiError } from './errors';

type ErrorMiddleware = (url: string, err: any) => void;

export const errorMiddlewares: ErrorMiddleware[] = [
    (url, err) => {
        if (ApiError.is(err, 'NotAuthenticated')) {
            useAuthStore.getState().markNotAuthenticated();
        }
    },
    (url, err) => {
        if (!ApiError.isApiError(err)) {
            useNotificationStore.getState().show('error', `Request to '${url}' failed: ${err}`);
        }
    }
];
