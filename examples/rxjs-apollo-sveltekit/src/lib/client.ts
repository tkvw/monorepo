import { ApolloClient, InMemoryCache, createHttpLink, gql, from } from '@apollo/client/core';
import { createOperation } from '@apollo/client/link/utils';

import type { IRetryLinkEvent } from '@tkvw/rxjs-apollo';
import {
  createAuthorizationLink,
  createRefreshTokenLink,
  apolloLink,
  createRetryLink
} from '@tkvw/rxjs-apollo';
import { map, of, Subject } from 'rxjs';

import { tokens$ } from '$lib/auth/tokens';
import type { RefreshJwtAuthTokenInput } from './generated.js';

const authorizationLink = createAuthorizationLink(tokens$);
const refreshTokenLink = createRefreshTokenLink({
  tokenSubject: tokens$,
  refreshOperation: (next, jwtRefreshToken) =>
    next(
      createOperation(
        {},
        {
          variables: {
            input: {
              jwtRefreshToken
            } as RefreshJwtAuthTokenInput
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
    ).pipe(
      map((response) => {
        if (response.data?.refreshJwtAuthToken?.authToken) {
          return {
            authToken: response.data?.refreshJwtAuthToken?.authToken,
            refreshToken: jwtRefreshToken
          };
        }
        return {};
      })
    )
});

const retryInfoSubject = new Subject<IRetryLinkEvent>();
export const retryInfo$ = retryInfoSubject.asObservable();
retryInfo$.subscribe((info) => {
  console.log('Retrying... ', info);
});

const retryLink = createRetryLink({
  inform: retryInfoSubject,
  maxRetries: 4,
  initialDelay: 200
});

export default of(
  new ApolloClient({
    cache: new InMemoryCache(),
    link: from([
      apolloLink(refreshTokenLink, authorizationLink, retryLink),
      createHttpLink({
        uri: 'https://wpdlf.tkvw.nl/graphqsl'
      })
    ])
  })
);
