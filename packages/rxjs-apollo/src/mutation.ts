import { ApolloClient } from '@apollo/client/core';
import type { OperationVariables, MutationOptions, DefaultContext, FetchResult } from '@apollo/client/core';
import { Observable, switchMap, OperatorFunction, from } from 'rxjs';

export function mutation<TData = any, TVariables = OperationVariables, TContext = DefaultContext>(
  options: Observable<MutationOptions<TData, TVariables, TContext>>
): OperatorFunction<ApolloClient<unknown>, FetchResult<TData>> {
  return (clientObservable) =>
    clientObservable.pipe(
      switchMap((client) =>
        options.pipe(
          switchMap(
            (options) =>
              new Observable<FetchResult<TData>>((observer) =>
                from(client.mutate<TData, TVariables, TContext>(options)).subscribe(observer)
              )
          )
        )
      )
    );
}
