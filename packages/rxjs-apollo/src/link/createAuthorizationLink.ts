import { from, ObservableInput, switchMap } from 'rxjs';

import { RxMiddleware } from '../apolloLink';

export interface IAuthorizationLinkOptions {
  addAuthorizationHeader?: (token: string, headers: Record<string, unknown>) => Record<string, unknown>;
}

export function createAuthorizationLink(
  token$: ObservableInput<string | undefined>,
  {
    addAuthorizationHeader = (token, headers) => ({
      ...headers,
      authorization: headers.authorization ?? `Bearer ${token}`
    })
  }: IAuthorizationLinkOptions = {}
): RxMiddleware {
  return (next) => (operation) =>
    from(token$).pipe(
      switchMap((authToken) => {
        if (!authToken) return next(operation);

        const { headers, ...ctx } = operation.getContext();
        operation.setContext({
          ...ctx,
          headers: addAuthorizationHeader(authToken, headers)
        });
        return next(operation);
      })
    );
}
