import { AuthenticatedUser } from './entities';

export interface Api {
    '/frontend/login': {
        request: {
            login: string;
            password: string;
        };
        response: AuthenticatedUser;
    };
    '/frontend/auth': {
        request: null;
        response: AuthenticatedUser;
    };
    '/frontend/sign_up': {
        request: {
            login: string;
            password: string;
            name: string;
            email: string;
        };
        response: AuthenticatedUser;
    };
    '/frontend/logout': {
        request: null;
        response: null;
    };
}
