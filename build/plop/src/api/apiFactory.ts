export interface ApiCallback<ApiOptions, Api> {
  <R>(options: ApiOptions, cb: (api: (options: Partial<ApiOptions>) => Api) => R): R;
  <R>(cb: (api: (options: Partial<ApiOptions>) => Api) => R): R;
}

export function apiFactory<ApiOptions, Api>(
  createApi: (options: ApiOptions) => Api
): ApiCallback<ApiOptions, Api> {
  return (...args: any[]) => {
    if (typeof args[0] === 'function') {
      return args[0](createApi);
    }
    return args[1]((options: Partial<ApiOptions>) =>
    createApi({
        ...args[0],
        ...options
      })
    );
  };
}
