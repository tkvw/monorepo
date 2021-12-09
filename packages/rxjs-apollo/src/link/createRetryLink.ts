import { ApolloLink } from '@apollo/client/core';
import { createRetry } from '@tkvw/rxjs';
import type { IRetryMessage, IOptionsWithTransformMessage, IOptions } from '@tkvw/rxjs';
import { Observable } from 'rxjs';
import { apolloLink } from '../apolloLink.js';

export interface IRetryLink<RetryMessage> {
  link: ApolloLink;
  retryMessages: Observable<RetryMessage>;
}
export function createRetryLink<CustomRetryMessage = IRetryMessage>(
  options: IOptionsWithTransformMessage<CustomRetryMessage>
): IRetryLink<CustomRetryMessage>;
export function createRetryLink(options?: IOptions): IRetryLink<IRetryMessage>;
export function createRetryLink(options?: IOptions) {
  const { createLink, retryMessages } = createRetry(options);

  const link = apolloLink((next) => (operation) => next(operation).pipe(createLink()));
  return {
    link,
    retryMessages
  };
}
