export interface ScreenState {
    status: 'ok' | 'loading' | 'error';
    error?: string;
}

export interface PayloadScreenState<T> extends ScreenState {
    payload?: T;
}
