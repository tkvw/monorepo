import { gql } from '@apollo/client/core/index.js';
import { of, Subject } from 'rxjs';

import { connectQuery, IQueryOptions } from '../connectQuery';
import { createClient } from './createMockClient';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
describe('query operator function', () => {
  it.only('test query', async () => {
    const client = of(
      createClient((operation) => {
        return {
          data: operation.getContext().response ?? null
        };
      })
    );
    const options = new Subject<IQueryOptions<{}, {}>>();
    const request = connectQuery(client)(options);
    const next = jest.fn();
    const subscription = request.subscribe({
      next
    });
    options.next({
      context: {
        response: {
          first: 'message'
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
