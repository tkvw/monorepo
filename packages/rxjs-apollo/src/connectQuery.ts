import type {
  ApolloQueryResult,
  FetchMoreOptions,
  FetchMoreQueryOptions,
  OperationVariables,
  SubscribeToMoreOptions,
  WatchQueryOptions
} from '@apollo/client/core';
import { ApolloClient, NetworkStatus } from '@apollo/client/core';
import { from, iif, map, NEVER, Observable, of, switchMap } from 'rxjs';

export interface IQueryOptions<TVariables, TData> extends WatchQueryOptions<TVariables, TData> {
  useInitialLoading?: boolean;
  skip?: boolean;
}
export interface IQueryResult<TVariables = OperationVariables, TData = unknown>
  extends ApolloQueryResult<TData> {
  options: IQueryOptions<TVariables, TData>;
  skipped: boolean;
  initialized: boolean;
}
export type IFetchMoreOptions<TVariables = OperationVariables, TData = unknown> = FetchMoreQueryOptions<
  TVariables,
  TData
> &
  FetchMoreOptions<TData, TVariables>;

export interface IQueryable {
  <
    TVariables = OperationVariables,
    TData = unknown,
    TSubscriptionData = TData,
    TSubscriptionVariables = TVariables
  >(
    options: Observable<IQueryOptions<TVariables, TData>>,
    fetchMoreOptions?: Observable<
      FetchMoreQueryOptions<TVariables, TData> & FetchMoreOptions<TData, TVariables>
    >,
    subscribeToMore?: Observable<SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData>>
  ): Observable<IQueryResult<TVariables, TData>>;
}

export function connectQuery(clientObservable: Observable<ApolloClient<unknown>>): IQueryable {
  return <
    TVariables = OperationVariables,
    TData = unknown,
    TSubscriptionData = TData,
    TSubscriptionVariables = TVariables
  >(
    options: Observable<IQueryOptions<TVariables, TData>>,
    fetchMoreOptions: Observable<IFetchMoreOptions<TVariables, TData>> = NEVER,
    subscribeToMore: Observable<
      SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData>
    > = NEVER
  ) =>
    clientObservable.pipe(
      switchMap((client) =>
        options.pipe(
          switchMap(({ skip = false, useInitialLoading = false, ...options }, count) =>
            iif(
              () => skip,
              of({
                data: {} as TData,
                skipped: true,
                loading: false,
                networkStatus: NetworkStatus.ready,
                options,
                initialized: count > 0
              }),
              new Observable<IQueryResult<TVariables, TData>>((observer) => {
                if (useInitialLoading && count === 0) {
                  observer.next({
                    data: {} as TData,
                    skipped: false,
                    loading: true,
                    networkStatus: NetworkStatus.loading,
                    options,
                    initialized: false
                  });
                }

                const watchQuery = client.watchQuery(options);

                const transformResult = (
                  result: ApolloQueryResult<TData>
                ): IQueryResult<TVariables, TData> => {
                  const transformed = {
                    ...result,
                    options,
                    skipped: false,
                    initialized: true
                  };
                  console.log({
                    result,
                    transformed
                  });
                  return transformed;
                };

                const watchQuerySubscription = watchQuery
                  .map(transformResult)
                  .subscribe(observer);
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
