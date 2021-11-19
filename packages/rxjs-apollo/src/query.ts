import { ApolloClient } from "@apollo/client/core";
import type {
  ApolloQueryResult,
  WatchQueryOptions,
  OperationVariables,
  FetchMoreQueryOptions,
  FetchMoreOptions,
  SubscribeToMoreOptions
} from "@apollo/client/core";
import { Observable, switchMap, iif, of, OperatorFunction, EMPTY,from } from "rxjs";

export interface RxQueryOptions<TVariables, TData>
  extends WatchQueryOptions<TVariables, TData> {
  skip?: boolean;
}

export function query<TVariables = OperationVariables, TData = any,TSubscriptionData = TData, TSubscriptionVariables = TVariables>(
  options: Observable<RxQueryOptions<TVariables, TData>>,
  fetchMoreOptions: Observable<FetchMoreQueryOptions<TVariables, TData> & FetchMoreOptions<TData, TVariables>> = EMPTY,
  subscribeToMore: Observable<SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData>> = EMPTY
): OperatorFunction<ApolloClient<unknown>,ApolloQueryResult<TData>> {
  return (clientObservable) =>
    clientObservable.pipe(
      switchMap((client) =>
        options.pipe(
          switchMap(({skip = false,...options}) =>
            iif(
              ()=> skip,
              of({ data: {} as TData,loading: false, networkStatus: 1 }),
              new Observable<ApolloQueryResult<TData>>(observer => {
                const watchQuery = client.watchQuery(options);
                const watchQuerySubscription = watchQuery.subscribe(observer);
                const fetchMoreSubscription = fetchMoreOptions.pipe(
                  switchMap(moreOptions => from(watchQuery.fetchMore(moreOptions)))
                ).subscribe(observer);
                const subscribeToMoreSubscription = subscribeToMore.subscribe(moreOptions => {
                  return watchQuery.subscribeToMore(moreOptions);
                });
                
                return function cleanUp(){
                  watchQuerySubscription.unsubscribe();
                  fetchMoreSubscription.unsubscribe();
                  subscribeToMoreSubscription.unsubscribe();
                }
              })
            )
          )
        )
      )
    );
}
