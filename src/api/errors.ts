const errors = {
    WrongUsernameOrPassword: null
};

type Errors = typeof errors;

export class ApiError<T extends keyof Errors> {
    public name: T;
    public details: Errors[T];

    constructor(name: T, details: Errors[T]) {
        this.name = name;
        this.details = details;
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
