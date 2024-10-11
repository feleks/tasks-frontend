export type UserID = number;

export interface User {
    id: UserID;
    login: string;
    name: string;
}

export interface AuthenticatedUser {
    login: string;
    name: string;
    email: string;
    phone?: string;
}

export type ProjectID = number;

export interface Project {
    id: ProjectID;
    title: string;
}

export type SongID = number;

export interface SongAction {
    id: number;
    type: 'navigate' | 'loop';
    name?: string;

    navigate?: number;
    loop?: [number, number];
}

export interface SongBrief {
    id: SongID;
    name: string;
    performer?: string;
    format: string;
}
export interface SongDetailed extends SongBrief {
    actions_history: SongAction[];
    saved_actions: SongAction[];
}
