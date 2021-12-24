import { ApolloClient, InMemoryCache, createHttpLink,  gql } from '@apollo/client/core';
import { createOperation } from '@apollo/client/link/utils';
import { browser } from '$app/env';

import type { IRefreshTokens } from '@tkvw/rxjs-apollo';
import { createAuthorizationLink, createRefreshTokenLink, fromRx } from '@tkvw/rxjs-apollo';
import { BehaviorSubject, Observable, of} from 'rxjs';

const isSsr = typeof window === 'undefined';
const AUTHTOKEN_KEY = '_authToken';
const REFRESHTOKEN_KEY = '_refreshToken';
export const authToken$ = new BehaviorSubject<string | undefined>(
  isSsr ? undefined : sessionStorage.getItem(AUTHTOKEN_KEY) ?? undefined
);
authToken$.subscribe((authToken) => {
  if (isSsr) return;

  if (!authToken) sessionStorage.removeItem(AUTHTOKEN_KEY);
  else sessionStorage.setItem(AUTHTOKEN_KEY, authToken);
});

export const refreshToken$ = new BehaviorSubject<string | undefined>(
  isSsr ? undefined : localStorage.getItem(REFRESHTOKEN_KEY) ?? undefined
);
refreshToken$.subscribe(function persistRefreshToken(token) {
  if (isSsr) return;

  if (!token) localStorage.removeItem(REFRESHTOKEN_KEY);
  else localStorage.setItem(REFRESHTOKEN_KEY, token);
});

refreshToken$.subscribe(function redirectToLogin(token) {
  if (!browser) return;

  //if(!token && browser) goto("/login");
});

const authorizationLink = createAuthorizationLink(authToken$);
const refreshTokenLink = createRefreshTokenLink({
  authTokenSubject: authToken$,
  refreshTokenSubject: refreshToken$,
  refreshOperation: (next, jwtRefreshToken) =>
    new Observable<IRefreshTokens>((observer) => {
      return next(
        createOperation(
          {},
          {
            variables: {
              jwtRefreshToken
            },
            query: gql`
              mutation RefreshToken($input: RefreshJwtAuthTokenInput!) {
                refreshJwtAuthToken(input: $input) {
                  authToken
                }
              }
            `
          }
        )
      ).subscribe(({ data }) => {
        observer.next({
          authToken: data?.refreshJwtAuthToken?.authToken
        });
        observer.complete();
      });
    })
});

const rxLink = fromRx(refreshTokenLink, authorizationLink);

export default of(
  new ApolloClient({
    cache: new InMemoryCache(),
    link: createHttpLink({
      uri: 'https://wpdlf.tkvw.nl/graphql',
      fetch: fetch
    })
  })
);
