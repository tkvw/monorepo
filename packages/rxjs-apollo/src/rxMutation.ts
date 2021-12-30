import type { DefaultContext, FetchResult, MutationOptions, OperationVariables } from '@apollo/client/core';
import { ApolloClient, ApolloError } from '@apollo/client/core';
import { catchError, from, map, Observable, of, startWith, Subject, switchMap, throwError } from 'rxjs';

import { ISubjectLike } from './index.js';

export interface IMutationOptions<TData = unknown, TVariables = OperationVariables, TContext = DefaultContext>
  extends MutationOptions<TData, TVariables, TContext> {
  client: ApolloClient<unknown>;
}

export interface IMutableResult<TData, TVariables, TContext> extends FetchResult<TData, TContext> {
  options?: IMutationOptions<TData, TVariables, TContext>;
  loading?: boolean;
  called: number;
}

export interface IRxMutation<TData, TVariables, TContext>
  extends Observable<IMutableResult<TData, TVariables, TContext>> {}

export function rxMutation<TData = unknown, TVariables = OperationVariables, TContext = DefaultContext>(): [
  ISubjectLike<IMutationOptions<TData, TVariables, TContext>>,
  IRxMutation<TData, TVariables, TContext>
];
export function rxMutation<TData = unknown, TVariables = OperationVariables, TContext = DefaultContext>(
  options$: Observable<IMutationOptions<TData, TVariables, TContext>>
): IRxMutation<TData, TVariables, TContext>;
export function rxMutation<TData = unknown, TVariables = OperationVariables, TContext = DefaultContext>(
  options$?: Observable<IMutationOptions<TData, TVariables, TContext>>
):
  | IRxMutation<TData, TVariables, TContext>
  | [ISubjectLike<IMutationOptions<TData, TVariables, TContext>>, IRxMutation<TData, TVariables, TContext>] {
  if (!options$) {
    const subject = new Subject<IMutationOptions<TData, TVariables, TContext>>();
    return [subject, rxMutation(subject.asObservable())];
  }
  return options$.pipe(
    switchMap((options, called) => {
      const { client, ...mutateOptions } = options;
      return (from(client.mutate(mutateOptions)) as Observable<IMutableResult<TData, TVariables, TContext>>).pipe(
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
        }))
      );
    }),
    startWith({
      called: 0,
      loading: false
    })
  ) as IRxMutation<TData, TVariables, TContext>;
}

// export function connectMutation(clientObservable: Observable<ApolloClient<unknown>>): IMutable {
//   return <TData = unknown, TVariables = OperationVariables, TContext = DefaultContext>(
//     options: Observable<MutationOptions<TData, TVariables, TContext>>
//   ) =>
//     clientObservable.pipe(
//       switchMap((client) => {
//         let called = 0;
//         return options.pipe(
//           switchMap((options) => {
//             return new Observable<IMutableResult<TData, TVariables, TContext>>((observer) => {
//               return from(client.mutate<TData, TVariables, TContext>(options))
//                 .pipe(
//                   startWith({
//                     loading: true,
//                     options,
//                     called: called++
//                   })
//                 )
//                 .subscribe({
//                   next: (result) =>
//                     observer.next({
//                       ...result,
//                       called,
//                       loading: false,
//                       options
//                     } as IMutableResult<TData, TVariables, TContext>),
//                   error: (error) => {
//                     if (error instanceof ApolloError) {
//                       const { graphQLErrors, networkError, ...rest } = error;
//                       if (networkError) return observer.error(networkError);
//                       return observer.next({
//                         ...rest,
//                         errors: graphQLErrors,
//                         options,
//                         called,
//                         loading: false
//                       });
//                     }
//                     observer.error(error);
//                   },
//                   complete: () => observer.complete()
//                 });
//             });
//           }),
//           startWith({
//             called: 0,
//             loading: false
//           })
//         );
//       })
//     );
// }
