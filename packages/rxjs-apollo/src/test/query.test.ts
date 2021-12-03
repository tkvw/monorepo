import {
  ApolloClient,
  InMemoryCache,
  gql,
  ApolloLink,
  Observable as ApolloObservable,
  Operation,
  FetchResult
} from '@apollo/client/core';
import {  of, Subject } from 'rxjs';

import { connectQuery } from '../connectQuery';

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
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
describe('query operator function', () => {
  it.only('test query', async () => {
    const client = of(createClient(operation => {
      debugger;
      return {
        data: operation.getContext()['response']??null
      }
    }));
    const options = new Subject<any>();
    const request = connectQuery(client)(options);
    const next = jest.fn();
    const subscription = request.subscribe({
      next
    });
    options.next({
      context: {
        response: {
          first: "message"
        }
      },
      query: gql`
        query {
          first
        }
      `
    });
    await delay(1);

    options.next({
      query: gql`
        query {
          second
        }
      `
    });
    await delay(1);

    expect(next).toBeCalledTimes(2);
    subscription.unsubscribe();
  });
});
