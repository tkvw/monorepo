import {
  tap,
  Observable,
  retryWhen,
  Subject,
  switchMap,
  race,
  of,
  BehaviorSubject,
  iif,
  timer,
  throwError,
  OperatorFunction
} from 'rxjs';

export interface IRetryMessage {
  attempt: number;
  error: unknown;
  cancel: () => void;
  setDelay: (nextDelay: number) => void;
}
export interface IOptions {
  maxAttempts?: Observable<number>;
  maximumBackoff?: number;
  delay?: (invocationCount: number, maxAttempts: number) => number;
}
export interface IOptionsWithTransformMessage<TransformedMessage> extends IOptions {
  transformMessage: (message: IRetryMessage) => TransformedMessage;
}

export interface IRetry<CustomRetryMessage> {
  retry: <T>() => OperatorFunction<T, T>;
  retryMessages: Observable<CustomRetryMessage>;
}

export function createRetry<CustomRetryMessage = IRetryMessage>(
  options: IOptionsWithTransformMessage<CustomRetryMessage>
): IRetry<CustomRetryMessage>;
export function createRetry(options?: IOptions): IRetry<IRetryMessage>;
export function createRetry<CustomRetryMessage = IRetryMessage>(
  options?: IOptions | IOptionsWithTransformMessage<CustomRetryMessage>
): IRetry<CustomRetryMessage> {
  options = options ?? {};
  const { maximumBackoff = 60 * 1000 } = options;
  const {
    delay = (counter) => Math.min(maximumBackoff, Math.pow(counter, 2) * 1000),
    maxAttempts: maxAttempts$ = of(5)
  } = options;
  const transformMessage =
    (options as IOptionsWithTransformMessage<CustomRetryMessage>).transformMessage ?? ((x) => x);

  const retryMessageSubject$ = new Subject<CustomRetryMessage>();

  const cancelSubject$ = new Subject<boolean>();
  const cancel = (): void => cancelSubject$.next(true);
  const delaySubject$ = new BehaviorSubject<number>(1000);
  const setDelay = (delay: number): void => delaySubject$.next(delay);

  const retry = <T>(): OperatorFunction<T, T> =>
    retryWhen<T>((error$) =>
      error$.pipe(
        switchMap((error, invocationCount) =>
          maxAttempts$.pipe(
            tap((maxAttempts) => delaySubject$.next(delay(invocationCount + 1, maxAttempts))),
            switchMap((maxAttempts) => {
              return iif(
                () => invocationCount < maxAttempts,
                race(
                  cancelSubject$,
                  delaySubject$.pipe(
                    tap(() =>
                      retryMessageSubject$.next(
                        transformMessage({
                          cancel,
                          setDelay,
                          attempt: invocationCount + 1,
                          error
                        })
                      )
                    ),
                    switchMap((delay) => timer(delay))
                  )
                ),
                throwError(() => error)
              );
            })
          )
        )
      )
    );
  return {
    retryMessages: retryMessageSubject$.asObservable(),
    retry
  };
}

export default createRetry;
