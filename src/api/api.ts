import { AuthenticatedUser, Project, ProjectID, SongAction, SongBrief, SongDetailed, SongFormat, SongID } from './entities';

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
        response: { songs: SongBrief[] };
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
        };
        response: SongBrief;
    };
    '/frontend/update_song': {
        request: {
            id: SongID;
            name: string;
            performer?: string;
        };
        response: null;
    };
    '/frontend/delete_song': {
        request: {
            id: SongID;
        };
        response: null;
    };

    '/frontend/create_action': {
        request: {
            song_id: SongID;
            type: 'point' | 'loop';
            point?: number;
            loop?: [number, number];
        };
        response: SongAction;
    };
    '/frontend/update_action': {
        request: {
            id: number;
            name?: string;
            position?: number;
        };
        response: null;
    };
    '/frontend/delete_action': {
        request: {
            id: number;
        };
        response: null;
    };
}
