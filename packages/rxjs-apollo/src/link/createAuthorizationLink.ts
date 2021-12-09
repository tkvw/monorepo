import { apolloLink } from '../apolloLink.js';
import { InteropObservable, from, switchMap, startWith } from 'rxjs';

export interface IAuthorizationLinkOptions {
    addAuthorizationHeader?: (token: string,headers: Record<string,any>) => Record<string,any>;
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
