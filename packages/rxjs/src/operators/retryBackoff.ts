import {
  BehaviorSubject,
  concatMap,
  defer,
  filter,
  iif,
  Observable,
  Observer,
  pipe,
  race,
  retryWhen,
  switchMapTo,
  take,
  tap,
  throwError,
  timer
} from 'rxjs';

export interface IRetryBackoffEvent {
  attempt: number;
  cancel: () => void;
  retryNow: () => void;
  nextAttemptDelay: number;
}

export interface IRetryBackoffOptions {
  start?: () => void;
  restored?: () => void;
  failedPermanently?: (error: unknown) => void;
  inform?: Observer<IRetryBackoffEvent>;
  initialDelay?: number;
  maxRetries?: number;
  maxDelay?: number;
  resetOnSuccess?: boolean;
  shouldRetry?: (error: unknown) => boolean;
  backoffDelay?: (attempt: number, initialDelay: number) => number;
}

export function retryBackoff({
  inform,
  initialDelay = 100,
  maxDelay = 60 * 1000,
  maxRetries = Infinity,
  shouldRetry = () => true,
  backoffDelay = (attempt, initialDelay) => Math.pow(attempt, 2) * initialDelay,
  resetOnSuccess = true,
  start,
  restored,
  failedPermanently
}: IRetryBackoffOptions = {}): <T>(source: Observable<T>) => Observable<T> {
  let index = 0;
  const cancel$ = new BehaviorSubject<boolean>(false);
  const cancelOnce$ = cancel$.pipe(
    filter((x) => x),
    take(1),
    tap(() => cancel$.next(false)) /* reset */
  );
  const cancel = () => cancel$.next(true);

  const retryNow$ = new BehaviorSubject<boolean>(false);
  const retryNowOnce$ = retryNow$.pipe(
    filter((x) => x),
    take(1),
    tap(() => retryNow$.next(false)) /* reset */
  );
  const retryNow = () => retryNow$.next(true);

  return pipe(
    retryWhen((errors) =>
      errors.pipe(
        concatMap((error) => {
          if (index === 0 && start) start();
          const attempt = ++index;
          return race(
            iif(
              () => attempt < maxRetries && shouldRetry(error),
              defer(() => {
                const nextAttemptDelay = Math.min(backoffDelay(attempt, initialDelay), maxDelay);
                if (inform) {
                  inform.next({
                    attempt,
                    cancel,
                    retryNow,
                    nextAttemptDelay
                  });
                }

                return race(retryNowOnce$, timer(nextAttemptDelay));
              }),
              defer(() => {
                if (failedPermanently) failedPermanently(error);
                return throwError(() => error);
              })
            ),
            cancelOnce$.pipe(switchMapTo(throwError(() => error)))
          );
        })
      )
    ),
    tap(() => {
      if (resetOnSuccess) {
        index = 0;
      }
      if (restored) {
        restored();
      }
    })
  );
}
