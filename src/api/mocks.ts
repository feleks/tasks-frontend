import { Api } from './api';
import { ApiError } from './errors';

export const MOCKS_MODE: 'default' | 'force_mocks' | 'force_fetch' = 'default';
export const MOCKS_TIMEOUT = 1000;

type Mocks = {
    [K in keyof Api]: (req: Api[K]['request']) => Api[K]['response'];
};

export const mocks: Mocks = {
    '/frontend/login': (req) => {
        return {
            login: 'feleks',
            email: 'nashvel@gmail.com',
            name: 'Георгий Калинчук',
            phone: '+7 (925) 559-14-41'
        };
    },
    '/frontend/auth': () => {
        throw new ApiError('NotAuthenticated', null);
    },
    '/frontend/sign_up': (req) => {
        return {
            login: req.login,
            email: req.email,
            name: req.name
        };
    },
    '/frontend/logout': () => {
        return null;
    }
};

export function mocksEnabled(): boolean {
    if (MOCKS_MODE === 'default') {
        return process.env.NODE_ENV === 'development';
    }

    return MOCKS_MODE === 'force_mocks';
}
