import {
  tap,
  Observable,
  retryWhen,
  Subject,
  switchMap,
  race,
  of,
  mergeMap,
  BehaviorSubject,
  iif,
  timer,
  throwError,
  OperatorFunction
} from 'rxjs';

export interface RetryMessage{
  attempt: number;
  error: any;
  cancel: () => void;
  setDelay: (nextDelay: number) => void;
}
export interface Options {
  maxAttempts?: Observable<number>;
  delay?: (invocationCount: number, maxAttempts: number) => number;
  
}
export interface OptionsWithTransformMessage<TransformedMessage> extends Options{
  transformMessage: (message: RetryMessage) => TransformedMessage;
}

export interface Retry<CustomRetryMessage>{
  retry: <T,R>() => OperatorFunction<T,R>;
  retryMessages: Observable<CustomRetryMessage>;  
}

export function createRetry<CustomRetryMessage = RetryMessage>(options: OptionsWithTransformMessage<CustomRetryMessage>): Retry<CustomRetryMessage>;
export function createRetry(options?: Options) : Retry<RetryMessage>;
export function createRetry<CustomRetryMessage = RetryMessage>(options?: Options | OptionsWithTransformMessage<CustomRetryMessage>) {
  options = options ?? {};

  const {
    delay = (counter) => Math.min(60*1000,Math.pow(counter,2) * 1000),
    maxAttempts: maxAttempts$ = of(5)
  } = options;
  const transformMessage = (options as OptionsWithTransformMessage<CustomRetryMessage>).transformMessage ?? 
    (x=>x);

  const retryMessageSubject$ = new Subject<CustomRetryMessage>();

  const cancelSubject$ = new Subject<boolean>();
  const cancel = () => cancelSubject$.next(true);
  const delaySubject$ = new BehaviorSubject<number>(1000);
  const setDelay = (delay: number) => delaySubject$.next(delay);
  
  const retry = () => retryWhen((error$) =>
    error$.pipe(
      mergeMap((error, invocationCount) =>
        maxAttempts$.pipe(
          tap((maxAttempts) => delaySubject$.next(delay(invocationCount+1, maxAttempts))),
          switchMap((maxAttempts) =>
            iif(
              () => invocationCount < maxAttempts,
              race(
                cancelSubject$,
                delaySubject$.pipe(
                  tap(() =>
                    retryMessageSubject$.next(
                      transformMessage({
                        cancel,
                        setDelay,
                        attempt: invocationCount+1,
                        error
                      })
                    )
                  ),
                  switchMap((delay) => timer(delay))
                )
              ),
              throwError(() => error)
            )
          )
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
