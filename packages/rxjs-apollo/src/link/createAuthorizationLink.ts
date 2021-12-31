import { FetchResult, Operation } from '@apollo/client/core';
import { from, switchMap, take, tap } from 'rxjs';

import { RxMiddleware } from '../apolloLink.js';
import { IRefreshTokens } from './IRefreshTokens.js';
import { ISubjectLike } from './ISubjectLike.js';

export interface IAuthorizationLinkOptions {
  addAuthorizationHeader?: (token: string, headers: Record<string, unknown>) => Record<string, unknown>;
  getNextAuthToken?: (response: FetchResult, operation: Operation, authToken: string) => string | undefined;
}

export function createAuthorizationLink(
  token$: ISubjectLike<IRefreshTokens>,
  {
    addAuthorizationHeader = (token, headers = {}) => ({
      ...headers,
      authorization: `Bearer ${token}`
    }),
    getNextAuthToken = (response, operation, authToken) => {
      if (response && response.errors && response.errors.length > 0) {
        return undefined;
      }
      return authToken;
    }
  }: IAuthorizationLinkOptions = {}
): RxMiddleware {
  const authTokens$ = from(token$).pipe(take(1));
  return (next) => (operation) =>
    authTokens$.pipe(
      switchMap(({ authToken, refreshToken }) => {
        if (!authToken) return next(operation);

        const { headers, ...ctx } = operation.getContext();
        const nextContext = {
          ...ctx,
          headers: addAuthorizationHeader(authToken, headers)
        };
        operation.setContext(nextContext);
        return next(operation).pipe(
          tap((data) => {
            const nextAuthToken = getNextAuthToken(data, operation, authToken);
            if (nextAuthToken !== authToken) {
              token$.next({
                authToken: nextAuthToken,
                refreshToken
              });
            }
          })
        );
      })
    );
}
