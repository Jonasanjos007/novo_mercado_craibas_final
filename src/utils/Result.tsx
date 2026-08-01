export interface ApiError {
    success: boolean;
    data: any;
    error: {
        code: string;
        message: string;
    };
}

export type Result<T> = {
    success: boolean;
    data?: T;
    error?: ApiError;

    fold: <R>(
        onSuccess: (data: T) => R,
        onFailure: (error: ApiError) => R
    ) => R;

    chain: <R>(
        next: (data: T) => Promise<Result<R>>
    ) => Promise<Result<R>>;
};

export function makeResult<T>(
    success: boolean,
    data?: T,
    error?: ApiError
): Result<T> {
    return {
        success,
        data,
        error,

        fold<R>(
            onSuccess: (data: T) => R,
            onFailure: (error: ApiError) => R
        ): R {
            if (success && data !== undefined) {
                return onSuccess(data);
            }

            return onFailure(
                error ?? {
                    success: false,
                    data: null,
                    error: {
                        code: "Erro",
                        message: "Erro desconhecido"
                    }
                }
            );
        },

        async chain<R>(
            next: (data: T) => Promise<Result<R>>
        ): Promise<Result<R>> {
            if (success && data !== undefined) {
                return next(data);
            }

            return makeResult<R>(false, undefined, error);
        }
    };
}