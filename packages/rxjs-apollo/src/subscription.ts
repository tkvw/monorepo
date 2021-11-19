import { ApolloClient } from "@apollo/client/core";
import type {
  OperationVariables,
  SubscriptionOptions,
  FetchResult
} from "@apollo/client/core";
import { Observable, switchMap, OperatorFunction } from "rxjs";

export function subscribe<TData=any, TVariables=OperationVariables>(
  options: Observable<SubscriptionOptions<TVariables, TData>>,  
): OperatorFunction<ApolloClient<unknown>,FetchResult<TData>> {
  return (clientObservable) =>
    clientObservable.pipe(
      switchMap((client) =>
        options.pipe(
          switchMap((options) =>          
            new Observable<FetchResult<TData>>(observer => {
                return client.subscribe(options).subscribe(observer);
            })
          )
        )
      )
    );
}
