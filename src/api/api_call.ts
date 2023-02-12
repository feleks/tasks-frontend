import { Api } from './api';
import { ApiError } from './errors';
import { mocks, MOCKS_TIMEOUT } from './mocks';

export function apiCall<U extends keyof Api, REQ extends Api[U]['request'], RES extends Api[U]['response']>(
    url: U,
    req: REQ,
    options: {
        useMocks?: boolean;
        mockTimeout?: number;
        mockError?: ApiError<any>;
    } = {}
): Promise<RES> {
    const { useMocks = process.env.NODE_ENV === 'development', mockTimeout = MOCKS_TIMEOUT, mockError } = options;

    console.log(`making request to ${url}`);

    if (useMocks) {
        if (mockError != null) {
            throw mockError;
        }

        const res = mocks[url](req);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(res as any);
            }, mockTimeout);
        });
    }

    return 1 as any;
}
