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
