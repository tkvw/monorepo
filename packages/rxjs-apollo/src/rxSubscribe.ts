import type { FetchResult,OperationVariables, SubscriptionOptions } from '@apollo/client/core';
import { ApolloClient,ApolloError } from '@apollo/client/core';
import { catchError, from, map, Observable, of, startWith, Subject,switchMap, throwError } from 'rxjs';

import { ISubjectLike } from './index.js';

export interface ISubscribeResult<TData = unknown, TVariables = OperationVariables> extends FetchResult<TData> {
  called: number;
  loading?: boolean;
  options: SubscriptionOptions<TVariables, TData>;
}
export interface ISubscribeOptions<TData,TVariables> extends SubscriptionOptions<TVariables, TData>{
  client: ApolloClient<unknown>;
}



export function rxSubscribe<TData = unknown, TVariables = OperationVariables>(): [
  ISubjectLike<ISubscribeOptions<TData, TVariables>>,
  Observable<ISubscribeResult<TData, TVariables>>
];
export function rxSubscribe<TData = unknown, TVariables = OperationVariables>(
  options$: Observable<ISubscribeOptions<TData, TVariables>>
): Observable<ISubscribeResult<TData, TVariables>>;
export function rxSubscribe<TData=unknown,TVariables = OperationVariables>(options$?: Observable<ISubscribeOptions<TData, TVariables>>)
: Observable<ISubscribeResult<TData, TVariables>> | [
  ISubjectLike<ISubscribeOptions<TData, TVariables>>,
  Observable<ISubscribeResult<TData, TVariables>>
]
{
  if (!options$) {
    const subject = new Subject<ISubscribeOptions<TData, TVariables>>();
    return [subject, rxSubscribe(subject.asObservable())];
  }
  return options$.pipe(
    switchMap((options, called) => {
      const { client, ...subscribeOptions } = options;
      return (from(client.subscribe(subscribeOptions)) as Observable<ISubscribeResult<TData, TVariables>>).pipe(
        catchError((error) => {
          if (error instanceof ApolloError) {
            const { graphQLErrors, networkError, ...rest } = error;
            if (networkError) return throwError(() => networkError);
            return of({
              ...rest,
              errors: graphQLErrors,
              options,
              called
            });
          }
          return throwError(() => error);
        }),
        map((result) => ({
          ...result,
          called: called+1
        })),
        startWith({
          called: called+1,
          loading: true
        } as ISubscribeResult<TData, TVariables>)
      );
    }),
    startWith({
      called: 0,
      loading: false
    })
  ) as Observable<ISubscribeResult<TData, TVariables>>;
}

