import { AuthenticatedUser, Project, ProjectID } from './entities';

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

    '/frontend/get_projects': {
        request: null;
        response: {
            projects: Project[];
        };
    };
    '/frontend/create_project': {
        request: {
            title: string;
        };
        response: Project;
    };
    '/frontend/update_project': {
        request: {
            id: ProjectID;
            title?: string;
        };
        response: null;
    };
    '/frontend/delete_project': {
        request: {
            id: ProjectID;
        };
        response: null;
    };
}
