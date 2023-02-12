import { Api } from "./api";

export const MOCKS_TIMEOUT = 1000;

type Mocks = {
    [K in keyof Api]: (req: Api[K]['request']) => Api[K]['response']
}

export const mocks: Mocks = {
    '/frontend/login': (req) => {
        return null;
    }
}
