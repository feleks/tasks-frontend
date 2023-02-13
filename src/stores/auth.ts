import { AuthenticatedUser } from 'src/api/entities';
import { create } from 'zustand';

interface AuthStore {
    savedUrl: string;
    status: 'in_progress' | 'complete' | 'error';
    user: AuthenticatedUser | null;
    globalError?: string;

    markAuthenticated(user: AuthenticatedUser): void;
    markNotAuthenticated(): void;
    markError(error: string): void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
    savedUrl: '/',
    status: 'in_progress',
    user: null,

    markAuthenticated(user: AuthenticatedUser): void {
        set(() => {
            return {
                status: 'complete',
                user
            };
        });
    },
    markNotAuthenticated(): void {
        let savedUrl = window.location.pathname;

        if (savedUrl === '/login' || savedUrl === '/sign_up') {
            savedUrl = '/';
        }

        set(() => {
            return {
                savedUrl,
                status: 'complete',
                user: null
            };
        });
    },
    markError(error: string): void {
        set(() => {
            return {
                status: 'error',
                globalError: error
            };
        });
    }
}));
