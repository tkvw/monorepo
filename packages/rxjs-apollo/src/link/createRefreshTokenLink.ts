import { ApolloLink, FetchResult } from '@apollo/client/core';
import {
  Observable,
  Observer,
  from,
  InteropObservable,
  Subscribable,
  startWith,
  switchMap,
  iif,
  Subject,
  finalize,
  Subscription
} from 'rxjs';
import { apolloLink, RxLink } from '../apolloLink.js';

export interface ISubjectLike<T> extends Observer<T>, InteropObservable<T> {}

export interface IRetryLink<RetryMessage> {
  link: ApolloLink;
  retryMessages: Observable<RetryMessage>;
}
interface ITokens {
  authToken?: string;
  refreshToken?: string;
}

export interface IRefreshTokenLinkOptions {
  authTokenSubject: ISubjectLike<string | undefined>;
  refreshTokenSubject: ISubjectLike<string | undefined>;
  refreshOperation: (next: RxLink, refreshToken: string) => InteropObservable<ITokens>;
}
export function createRefreshTokenLink({
  authTokenSubject,
  refreshTokenSubject,
  refreshOperation
}: IRefreshTokenLinkOptions) {
  return apolloLink((next) => {
    let underway: Subject<void> | undefined;
    return (operation) => {
      const next$ = next(operation);

      const tryToRefreshToken$ = from(refreshTokenSubject).pipe(
        switchMap((refreshToken) =>
          iif(
            () => !refreshToken,
            next$,
            new Observable<FetchResult>((observer) => {
              underway = new Subject<void>();

              const unsubscribe = from(refreshOperation(next, refreshToken!)).subscribe({
                next: (tokens) => {
                  authTokenSubject.next(tokens.authToken);
                  if (refreshToken !== tokens.refreshToken) {
                    refreshTokenSubject.next(tokens.refreshToken);
                  }
                  refreshTokenSubject.next(refreshToken);
                },
                error: (e) => underway!.error(e),
                complete: () => {
                  underway!.complete();
                  underway = undefined;
                }
              });

              unsubscribe.add(
                underway.subscribe({
                  complete: () => unsubscribe.add(next$.subscribe(observer))
                })
              );
              return unsubscribe;
            })
          )
        )
      );
      const authToken$ = from(authTokenSubject).pipe(
        switchMap((authToken) => iif(() => !authToken, tryToRefreshToken$, next$))
      );

      return new Observable((observer) => {
        const sub = new Subscription();
        if (underway) {
          sub.add(
            underway.subscribe({
              complete: () => sub.add(authToken$.subscribe(observer))
            })
          );
        } else {
          sub.add(authToken$.subscribe(observer));
        }
        return sub;
      });
    };
  });
}
