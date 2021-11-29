import createRetry,{Options,OptionsWithTransformMessage,RetryMessage} from '@tkvw/rxjs/operators/createRetry';
import {apolloLink} from "../apolloLink.js"


export function createRetryLink<CustomRetryMessage = RetryMessage>(options: OptionsWithTransformMessage<CustomRetryMessage>);
export function createRetryLink(options?: Options);
export function createRetryLink(options: Options){
    const {retry,retryMessages} = createRetry(options);

    const link = apolloLink(next => operation => next(operation).pipe(
      retry()
    ));
    return {
      link,
      retryMessages
    }
}
