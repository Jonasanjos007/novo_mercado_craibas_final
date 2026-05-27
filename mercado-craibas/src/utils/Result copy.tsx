export type Result<T> = {
  success: boolean;
  data?: T;
  error?: string;

  fold: <R>(onSuccess: (data: T) => R, onFailure: (error: string) => R) => R;
  chain: <R>(next: (data: T) => Promise<Result<R>>) => Promise<Result<R>>;
};

export function makeResult<T>(success: boolean, data?: T, error?: string): Result<T> {
  return {
    success: success,
    data: data,
    error: error,
    
    fold(onSuccess, onFailure) {
      return success && data !== undefined
        ? onSuccess(data)
        : onFailure(error || "Erro desconhecido");
    },

    async chain<R>(next: (data: T) => Promise<Result<R>>): Promise<Result<R>> {
      if (success && data !== undefined) {
        return next(data);
      }
      return makeResult<R>(false, undefined, error);
    }
  };
}
