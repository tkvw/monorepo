import { ApolloLink, FetchResult, Observable as ApolloObservable, Operation } from '@apollo/client/core';
import { Observable } from 'rxjs';

export type RxLink = (operation: Operation) => Observable<FetchResult>;
export type RxMiddleware = (next: RxLink) => RxLink;

export function apolloLink(createLink: RxMiddleware){
    return new ApolloLink(
    (operation, forward) => {
        const link = createLink(op => new Observable(observer => forward(op).subscribe(observer)));

        return new ApolloObservable(observer => link(operation).subscribe(observer));
    });
}


export function fromRx(...links:RxMiddleware[]): RxMiddleware{
    return (next) => {
        const [seed,...rest] = links.reverse();
        return rest.reduce((acc,item)=> item(acc),seed(next));
    }
}