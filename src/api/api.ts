export interface Api {
    '/frontend/login': {
        request: {
            login: string;
            password: string;
        };
        response: null;
    };
}
