import { ApolloClient } from '@apollo/client/core';
import type { OperationVariables, MutationOptions, DefaultContext, FetchResult } from '@apollo/client/core';
import { Observable, switchMap, from, map } from 'rxjs';

export interface IMutable {
  <TData = any, TVariables = OperationVariables, TContext = DefaultContext>(
    options: Observable<MutationOptions<TData, TVariables, TContext>>
  ): Observable<FetchResult<TData>>;
}
export interface IMutableResult<TData = any, TVariables = OperationVariables, TContext = DefaultContext>
  extends FetchResult<TData> {
  options: MutationOptions<TData, TVariables, TContext>;
}

export function connectMutation(clientObservable: Observable<ApolloClient<unknown>>): IMutable {
  return <TData = any, TVariables = OperationVariables, TContext = DefaultContext>(
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
