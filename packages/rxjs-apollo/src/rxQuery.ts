import type {
  ApolloQueryResult,
  FetchMoreOptions,
  FetchMoreQueryOptions,
  OperationVariables,
  WatchQueryOptions
} from '@apollo/client/core';
import { ApolloClient, ApolloError, NetworkStatus } from '@apollo/client/core';
import { catchError, from, map, merge, Observable, of, startWith, Subject, switchMap } from 'rxjs';

export interface IQueryOptions<TVariables, TData> extends WatchQueryOptions<TVariables, TData> {
  client: ApolloClient<unknown>;
  skip?: boolean;
}
export interface IQueryResult<TVariables = OperationVariables, TData = unknown>
  extends ApolloQueryResult<TData> {
  options: IQueryOptions<TVariables, TData>;
  skipped?: boolean;
}

export interface IRxQuery<TVariables, TData> extends Observable<IQueryResult<TVariables, TData>> {
  fetchMore: (
    options: FetchMoreQueryOptions<TVariables, TData> & FetchMoreOptions<TData, TVariables>
  ) => void;
  refetch: (variables?: TVariables) => void;
}

export function rxQuery<TVariables, TData>(
  options$: Observable<IQueryOptions<TVariables, TData>>
): IRxQuery<TVariables, TData> {
  const initial: Omit<IQueryResult<TVariables, TData>, 'options'> = {
    data: {} as TData,
    loading: false,
    networkStatus: NetworkStatus.ready
  };

  const fetchMoreOptions$ = new Subject<
    FetchMoreQueryOptions<TVariables, TData> & FetchMoreOptions<TData, TVariables>
  >();
  const refetchVariables$ = new Subject<Partial<TVariables> | undefined>();

  const rxQuery$ = options$.pipe(
    switchMap((options) => {
      const { skip = false, ...restOptions } = options;

      if (skip) {
        return of({
          ...initial,
          options,
          skipped: true
        });
      }
      const { client, notifyOnNetworkStatusChange = true, ...rest } = restOptions;
      const watchQueryOptions: WatchQueryOptions<TVariables, TData> = {
        ...rest,
        notifyOnNetworkStatusChange
      };
      const apolloQuery = client.watchQuery(watchQueryOptions);

      const loadingData = {
        ...initial,
        loading: true,
        networkStatus: NetworkStatus.loading,
        options
      };
      const errorHandler = catchError<ApolloQueryResult<TData>, Observable<ApolloQueryResult<TData>>>(
        (error) => {
          const errorData = {
            ...initial,
            error,
            networkStatus: NetworkStatus.error,
            options
          };

          if (error instanceof ApolloError) {
            const { graphQLErrors, networkError } = error;

            return of({
              ...errorData,
              errors: graphQLErrors,
              error: networkError
            });
          }
          return of(errorData);
        }
      );

      return merge(
        (from(apolloQuery) as Observable<ApolloQueryResult<TData>>).pipe(
          errorHandler,
          startWith(loadingData),
          map((result) => ({
            ...result,
            options
          }))
        ),
        fetchMoreOptions$.pipe(
          switchMap((fetchMoreOptions) =>
            from(apolloQuery.fetchMore(fetchMoreOptions)).pipe(
              errorHandler,
              startWith(loadingData),
              map((result) => ({
                ...result,
                options: {
                  ...options,
                  ...fetchMoreOptions,
                  variables: {
                    ...options.variables,
                    ...fetchMoreOptions.variables
                  } as TVariables
                }
              }))
            )
          )
        ),
        refetchVariables$.pipe(
          switchMap((variables) =>
            from(apolloQuery.refetch(variables)).pipe(
              errorHandler,
              startWith(loadingData),
              map((result) => ({
                ...result,
                options: {
                  ...options,
                  variables: {
                    ...options.variables,
                    ...variables
                  } as TVariables
                }
              }))
            )
          )
        )
      );
    })
  );
  const result = Object.assign(rxQuery$, {
    fetchMore: (options: FetchMoreQueryOptions<TVariables, TData> & FetchMoreOptions<TData, TVariables>) => {
      fetchMoreOptions$.next(options);
    },
    refetch: (variables?: TVariables) => refetchVariables$.next(variables)
  });
  return result;
}
