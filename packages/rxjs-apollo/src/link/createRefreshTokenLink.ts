import { FetchResult, Operation } from '@apollo/client/core';
import { from, map, Observable, ObservableInput, of, Subject, Subscription, switchMap, take } from 'rxjs';

import { RxLink, RxMiddleware } from '../apolloLink.js';
import { IRefreshTokens } from './IRefreshTokens.js';
import { ISubjectLike } from './ISubjectLike.js';

export interface IRefreshTokenLinkOptions {
  tokenSubject: ISubjectLike<IRefreshTokens>;
  refreshOperation: (next: RxLink, refreshToken: string) => ObservableInput<IRefreshTokens>;
}
export function createRefreshTokenLink({
  tokenSubject,
  refreshOperation
}: IRefreshTokenLinkOptions): RxMiddleware {
  const tokenSubject$ = from(tokenSubject);

  const refreshToken$ = tokenSubject$.pipe(
    take(1),
    map(({ refreshToken }) => refreshToken)
  );

  const shouldRefreshToken$ = tokenSubject$.pipe(
    take(1),
    map(({ authToken, refreshToken }) => {
      if (!refreshToken) return false;
      if (refreshToken && !authToken) return true;
      const authTokenIsOutdated = false;
      return authTokenIsOutdated;
    })
  );
  const canRefresh$ = tokenSubject$.pipe(
    take(1),
    map(({ refreshToken }) => !!refreshToken)
  );

  return (next) => {
    let refreshTokenUnderway$: Subject<void> | undefined;
    const createRefresh = (operation: Operation) => {
      refreshTokenUnderway$ = new Subject();
      return new Observable<FetchResult>((observer) => {
        const tearDown = new Subscription();
        tearDown.add(
          refreshToken$
            .pipe(switchMap((refreshToken) => (refreshToken ? refreshOperation(next, refreshToken) : of({}))))
            .subscribe((refreshTokens) => {
              tokenSubject.next(refreshTokens);
              tearDown.add(next(operation).subscribe(observer));
              refreshTokenUnderway$?.complete();
              refreshTokenUnderway$ = undefined;
            })
        );
        return tearDown;
      });
    };
    const isUnauthorizedResponse = (result: FetchResult, operation: Operation) => {
      if(result?.errors && result.errors.length>0){
        return true;
      }
      return false;
    };
    return (operation: Operation) =>
      new Observable<FetchResult>((observer) => {
        if (refreshTokenUnderway$ !== undefined) {
          const tearDown = new Subscription();
          tearDown.add(
            refreshTokenUnderway$.subscribe({
              complete: () => tearDown.add(next(operation).subscribe(observer))
            })
          );
          // A refresh token request is already underway
          // let's wait for its result and continue
          return tearDown;
        }

        return shouldRefreshToken$
          .pipe(
            switchMap((shouldRefreshToken) =>
              shouldRefreshToken ? createRefresh(operation) : next(operation)
            ),
            switchMap((result) => {
              // It is possible the server responded with an authorization error response
              // Let's act on this if we have a refreshtoken
              return isUnauthorizedResponse(result, operation)
                ? canRefresh$.pipe(
                    switchMap((canRefresh) => (canRefresh ? createRefresh(operation) : of(result)))
                  )
                : of(result);
            })
          )
          .subscribe(observer);
      });
  };
}
