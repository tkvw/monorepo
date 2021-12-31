import type { FetchResult, Operation } from '@apollo/client/core';
import type { IRetryBackoffEvent, IRetryBackoffOptions } from '@tkvw/rxjs/operators';
import { retryBackoff } from '@tkvw/rxjs/operators';
import { Observable, Observer, Subject } from 'rxjs';

import { RxMiddleware } from '../apolloLink.js';

export interface IRetryLinkEvent extends IRetryBackoffEvent {
  operations: Operation[];
}

export interface IRetryLinkOptions extends Omit<IRetryBackoffOptions, 'inform'> {
  inform?: Observer<IRetryLinkEvent>;
}

export function createRetryLink({ inform, ...options }: IRetryLinkOptions = {}): RxMiddleware {
  return (next) => {
    let retryQueue: Subject<void> | undefined = undefined;
    let operations: Operation[] | undefined = undefined;

    const clear = () => {
      const tmp = retryQueue;
      retryQueue = undefined;
      operations = undefined;
      return tmp;
    };
    const retryBackoffOptions: IRetryBackoffOptions = {
      restored: () => clear()?.complete(),
      failedPermanently: (error) => clear()?.error(error),
      inform: inform
        ? {
            error: inform.error,
            complete: inform.complete,
            next: (event) =>
              inform.next({
                ...event,
                operations: operations!
              })
          }
        : undefined,
      ...options
    };

    return function execute(operation: Operation) {
      console.log('operation: ', operation);
      return new Observable<FetchResult>((observer) => {
        if (retryQueue) {
          operations?.push(operation);
          return retryQueue.subscribe({
            error: (error) => observer.error(error),
            complete: () => execute(operation)
          });
        }
        return next(operation)
          .pipe(
            retryBackoff({
              start: () => {
                retryQueue = new Subject<void>();
                operations = [operation];
              },
              ...retryBackoffOptions
            })
          )
          .subscribe(observer);
      });
    };
  };
}
