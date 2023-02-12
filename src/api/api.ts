import { AuthenticatedUser } from "./entities";

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
}
