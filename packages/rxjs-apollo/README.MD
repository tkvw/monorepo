# @Tkvw\rxjs-apollo

This library allows to use apollo client in a reactive way using the rxjs library. 

```ts
import { rxQuery } from "@tkvw/rxjs-apollo"
import { of, BehaviourSubject } from "rxjs";
import { ApolloClient } from "@apollo/client/core";

const [options$,results$] = rxQuery();

options$.next({
    query: gql`{
        message
    }`
});

results$.subscribe(({loading,data}) => console.log({loading,data}))


```