import { ApolloClient } from '@apollo/client/core';
import type {
  ApolloQueryResult,
  WatchQueryOptions,
  OperationVariables,
  FetchMoreQueryOptions,
  FetchMoreOptions,
  SubscribeToMoreOptions
} from '@apollo/client/core';
import { Observable, switchMap, iif, of, map, from, NEVER } from 'rxjs';

export interface IQueryOptions<TVariables, TData> extends WatchQueryOptions<TVariables, TData> {
  skip?: boolean;
}
export interface IQueryResult<TVariables = OperationVariables,TData = any> extends ApolloQueryResult<TData>{
  options: IQueryOptions<TVariables, TData>,
  skipped?: boolean;
}
export type IFetchMoreOptions<TVariables = OperationVariables,TData = any> = FetchMoreQueryOptions<TVariables, TData> & FetchMoreOptions<TData, TVariables> 

export interface IQueryable {
  <
    TVariables = OperationVariables,
    TData = any,
    TSubscriptionData = TData,
    TSubscriptionVariables = TVariables
  >(
    options: Observable<IQueryOptions<TVariables, TData>>,
    fetchMoreOptions?: Observable<
      FetchMoreQueryOptions<TVariables, TData> & FetchMoreOptions<TData, TVariables>
    >,
    subscribeToMore?: Observable<SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData>>
  ): Observable<IQueryResult<TVariables,TData>>;
}


export function connectQuery(clientObservable: Observable<ApolloClient<unknown>>): IQueryable {
  return <
    TVariables = OperationVariables,
    TData = any,
    TSubscriptionData = TData,
    TSubscriptionVariables = TVariables
  >(
    options: Observable<IQueryOptions<TVariables, TData>>,
    fetchMoreOptions: Observable<IFetchMoreOptions<TVariables,TData>> = NEVER,
    subscribeToMore: Observable<
      SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData>
    > = NEVER
  ) =>
    clientObservable.pipe(
      switchMap((client) =>
        options.pipe(
          switchMap(({ skip = false, ...options }) =>
            iif(
              () => skip,
              of({ data: {} as TData, loading: false, networkStatus: 1, options,skipped: true }),
              new Observable<IQueryResult<TVariables,TData>>((observer) => {
                const watchQuery = client.watchQuery(options);

                const transformResult = (result: ApolloQueryResult<TData>) => ({
                  ...result,
                  options,
                  skipped: false
                })
                  
                const watchQuerySubscription = watchQuery.map(transformResult).subscribe(observer);
                const fetchMoreSubscription = fetchMoreOptions
                  .pipe(
                    switchMap((moreOptions) => from(watchQuery.fetchMore(moreOptions))),
                    map(transformResult)
                  )
                  .subscribe(observer);
                const subscribeToMoreSubscription = subscribeToMore.subscribe((moreOptions) => {
                  return watchQuery.subscribeToMore(moreOptions);
                });

                return function cleanUp() {
                  watchQuerySubscription.unsubscribe();
                  fetchMoreSubscription.unsubscribe();
                  subscribeToMoreSubscription.unsubscribe();
                };
              })
            )
          )
        )
      )
    );
}
