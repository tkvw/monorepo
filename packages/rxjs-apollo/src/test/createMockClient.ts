import {
  ApolloClient,
  ApolloLink,
  FetchResult,
  InMemoryCache,
  Observable as ApolloObservable,
  Operation} from '@apollo/client/core/index.js';

export interface IMockResultResolver{
    (operation: Operation): FetchResult
  }
  
export function createMockLink(resolver: IMockResultResolver) {
  return new ApolloLink((operation) => {
    return new ApolloObservable((observer) => {
      observer.next(resolver(operation));
      observer.complete();
    });
  });
}

export function createClient(resolver: IMockResultResolver) {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: createMockLink(resolver)
  });
}
