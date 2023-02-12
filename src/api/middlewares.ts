import { useAuthStore } from 'src/stores/auth';
import { ApiError } from './errors';

type ErrorMiddleware = (err: any) => void;

export const errorMiddlewares: ErrorMiddleware[] = [
    (err) => {
        if (ApiError.is(err, 'NotAuthenticated')) {
            useAuthStore.getState().markNotAuthenticated();
        }
    }
];
