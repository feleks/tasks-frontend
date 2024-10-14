export type UserID = number;

export interface User {
    id: UserID;
    login: string;
}

export interface AuthenticatedUser {
    login: string;
}

export type ProjectID = number;

export interface Project {
    id: ProjectID;
    title: string;
}

export type SongID = number;

export interface SongAction {
    id: number;
    type: 'point' | 'loop';
    created_at: string;
    name?: string;

    point?: number;
    loop?: [number, number];
}

export type SongFormat = 'flac' | 'mp3';

export interface SongBrief {
    id: SongID;
    name: string;
    performer?: string;
    format: string;
}
export interface SongDetailed extends SongBrief {
    actions: SongAction[];
}
