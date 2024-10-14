import { Api } from './api';
import { ApiError } from './errors';
import { errorMiddlewares } from './middlewares';
import { mocks, MOCKS_TIMEOUT, mocksEnabled } from './mocks';

type MocksOptions = {
    useMocks?: boolean;
    mockTimeout?: number;
    mockError?: ApiError<any>;
};

type Options = {
    mock?: MocksOptions;
    files?: File[];
};

export async function apiCall<U extends keyof Api, REQ extends Api[U]['request'], RES extends Api[U]['response']>(
    url: U,
    req: REQ,
    options: Options = {}
): Promise<RES> {
    const { mock: mockOptions = {}, files = [] } = options;
    let { useMocks } = mockOptions;
    const { mockTimeout = MOCKS_TIMEOUT, mockError } = mockOptions;

    if (useMocks == null) {
        useMocks = mocksEnabled();
    }

    console.log(`making request to ${url}`);

    try {
        if (useMocks) {
            return await new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        if (mockError != null) {
                            reject(mockError);
                        } else {
                            const mockFunc = mocks[url] as any;
                            const res = mockFunc(req);
                            resolve(res as any);
                        }
                    } catch (e) {
                        reject(e);
                    }
                }, mockTimeout);
            });
        }

        let rawResponse: Response;
        if (files.length > 0) {
            const formData = new FormData();

            if (req != null) {
                formData.set('json', JSON.stringify(req));
            } else {
                formData.set('json', '{}');
            }

            for (const file of files) {
                formData.append('files', file);
            }

            rawResponse = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json'
                    // 'Content-Type': 'multipart/form-data'
                },
                body: formData
            });
        } else {
            rawResponse = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: req != null ? JSON.stringify(req) : undefined
            });
        }

        return await parseRequestResults(rawResponse);
    } catch (e) {
        for (const middleware of errorMiddlewares) {
            middleware(url, e);
        }

        throw e;
    }
}

async function parseRequestResults(rawResponse: Response): Promise<any> {
    const res = await rawResponse.json();

    if (res?.status === 'error') {
        const errorInfo = res?.error_info;
        const errorName = errorInfo?.name;
        const errorDetails = errorInfo?.details;
        const errorDebugMessage = errorInfo?.debug_message;
        const errorText = errorInfo?.text;

        const apiError = new ApiError(errorName, errorDetails, errorDebugMessage, errorText);
        throw apiError;
    } else if (res?.status === 'ok') {
        const payload = res?.payload;
        return payload;
    } else {
        console.error('Wrong response format', { res });
        throw new Error('Wrong response format');
    }
}
