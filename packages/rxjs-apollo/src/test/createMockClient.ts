import {
  ApolloClient,
  InMemoryCache,
  gql,
  ApolloLink,
  Observable as ApolloObservable,
  Operation,
  FetchResult
} from '@apollo/client/core';

export interface MockResultResolver{
    (operation: Operation): FetchResult
  }
  
export function createMockLink(resolver: MockResultResolver) {
  return new ApolloLink((operation) => {
    return new ApolloObservable((observer) => {
      observer.next(resolver(operation));
      observer.complete();
    });
  });
}

export function createClient(resolver: MockResultResolver) {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: createMockLink(resolver)
  });
}
