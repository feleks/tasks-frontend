import { AuthenticatedUser, Project, ProjectID, SongBrief, SongDetailed, SongFormat, SongID } from './entities';

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

    '/frontend/list_songs': {
        request: null;
        response: SongBrief[];
    };
    '/frontend/get_song': {
        request: { id: SongID };
        response: SongDetailed;
    };
    '/frontend/create_song': {
        request: {
            name: string;
            performer?: string;
            format: SongFormat;
            data: string;
        };
        response: SongBrief;
    };
}
