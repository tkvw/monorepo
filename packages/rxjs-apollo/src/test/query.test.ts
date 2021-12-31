import { gql } from '@apollo/client/core';
import { Subject } from 'rxjs';

import { IQueryOptions,rxQuery } from '../rxQuery';
import { createClient } from './createMockClient';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
describe('query operator function', () => {
  it.only('test query', async () => {
    const client = createClient((operation) => {
      return {
        data: operation.getContext().response ?? null
      };
    });
    const options = new Subject<IQueryOptions<{}, {}>>();
    const request = rxQuery(options);
    const next = jest.fn();
    const subscription = request.subscribe({
      next
    });
    options.next({
      client,
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
      client,
      query: gql`
        query {
          second
        }
      `
    });
    await delay(1);

    expect(next).toBeCalledTimes(1 /* load */ + 1 /* response */ + 1 /* load */ + 1 /* response */);
    subscription.unsubscribe();
  });
});
