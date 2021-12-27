import type { FetchResult,OperationVariables, SubscriptionOptions } from '@apollo/client/core';
import { ApolloClient } from '@apollo/client/core';
import { Observable, switchMap } from 'rxjs';

export interface ISubscribeResult<TData = unknown, TVariables = OperationVariables> extends FetchResult<TData> {
  options: SubscriptionOptions<TVariables, TData>;
}

export interface ISubscribeable {
  <TData = unknown, TVariables = OperationVariables>(
    options: Observable<SubscriptionOptions<TVariables, TData>>
  ): Observable<ISubscribeResult<TData, TVariables>>;
}

export function connectSubscribe(clientObservable: Observable<ApolloClient<unknown>>): ISubscribeable {
  return <TData = unknown, TVariables = OperationVariables>(
    options: Observable<SubscriptionOptions<TVariables, TData>>
  ) =>
    clientObservable.pipe(
      switchMap((client) =>
        options.pipe(
          switchMap(
            (options) =>
              new Observable<ISubscribeResult<TData, TVariables>>((observer) => {
                return client
                  .subscribe(options)
                  .map((result) => ({
                    ...result,
                    options
                  }))
                  .subscribe(observer);
              })
          )
        )
      )
    );
}
