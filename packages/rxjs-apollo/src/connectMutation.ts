import type { DefaultContext, FetchResult,MutationOptions, OperationVariables } from '@apollo/client/core';
import { ApolloClient } from '@apollo/client/core';
import { from, map,Observable, switchMap } from 'rxjs';

export interface IMutable {
  <TData = unknown, TVariables = OperationVariables, TContext = DefaultContext>(
    options: Observable<MutationOptions<TData, TVariables, TContext>>
  ): Observable<FetchResult<TData>>;
}
export interface IMutableResult<TData = unknown, TVariables = OperationVariables, TContext = DefaultContext>
  extends FetchResult<TData> {
  options: MutationOptions<TData, TVariables, TContext>;
}

export function connectMutation(clientObservable: Observable<ApolloClient<unknown>>): IMutable {
  return <TData = unknown, TVariables = OperationVariables, TContext = DefaultContext>(
    options: Observable<MutationOptions<TData, TVariables, TContext>>
  ) =>
    clientObservable.pipe(
      switchMap((client) =>
        options.pipe(
          switchMap(
            (options) =>
              new Observable<FetchResult<TData>>((observer) =>
                from(client.mutate<TData, TVariables, TContext>(options))
                  .pipe(
                    map((result) => ({
                      ...result,
                      options
                    }))
                  )
                  .subscribe(observer)
              )
          )
        )
      )
    );
}
