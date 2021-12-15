import { from, InteropObservable,switchMap } from 'rxjs';

import { apolloLink } from '../apolloLink';

export interface IAuthorizationLinkOptions {
    addAuthorizationHeader?: (token: string,headers: Record<string,unknown>) => Record<string,unknown>;
}

export function createAuthorizationLink(
  token$: InteropObservable<string>,
  { addAuthorizationHeader = (token,headers) => ({
      ...headers,
      authorization: headers.authorization ?? `Bearer ${token}`
  }) }: IAuthorizationLinkOptions = {}
) {
  return apolloLink(
    (next) => (operation) =>
      from(token$).pipe(
        switchMap((authToken) => {
          if (!authToken) return next(operation);

          const { headers, ...ctx } = operation.getContext();
          operation.setContext({
            ...ctx,
            headers: addAuthorizationHeader(authToken,headers)
          });
          return next(operation);
        })
      )
  );
}
