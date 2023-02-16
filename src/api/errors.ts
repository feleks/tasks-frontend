const errors = {
    NotAuthenticated: null,
    WrongLoginOrPassword: null
};

type Errors = typeof errors;

export class ApiError<T extends keyof Errors> {
    public name: T;
    public details: Errors[T];
    public debugMessage?: string;

    constructor(name: T, details: Errors[T], debugMessage?: string) {
        const errorsSet = new Set(Object.keys(errors));

        if (!errorsSet.has(name)) {
            throw new Error(`No api error named ${name}`);
        }
        this.name = name;
        this.details = details;
        this.debugMessage = debugMessage;
    }

    static isApiError(e: any): boolean {
        return e instanceof ApiError;
    }

    static is<U extends keyof Errors>(e: any, name: U): boolean {
        const apiErr = ApiError.extract(e, name);

        return apiErr != null;
    }

    static extract<U extends keyof Errors>(e: any, name: U): ApiError<U> | null {
        if (!(e instanceof ApiError)) {
            return null;
        }

        if (e.name !== name) {
            return null;
        }

        return e as any;
    }
}
