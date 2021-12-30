import { ApolloLink, FetchResult, Observable as ApolloObservable, Operation } from '@apollo/client/core';
import { Observable } from 'rxjs';

export type RxLink = (operation: Operation) => Observable<FetchResult>;
export type RxMiddleware = (next: RxLink) => RxLink;

export function apolloLink(...links: RxMiddleware[]) {
  const rxLink = fromRx(...links);
  return new ApolloLink((operation, forward) => {
    const link = rxLink((op) => new Observable((observer) => forward(op).subscribe(observer)));

    return new ApolloObservable((observer) => link(operation).subscribe(observer));
  });
}

export function fromRx(...links: RxMiddleware[]): RxMiddleware {
  if (links.length === 1) return links[0];
  const [seed, ...rest] = links.reverse();
  return (next) => rest.reduce((acc, item) => item(acc), seed(next));
}
