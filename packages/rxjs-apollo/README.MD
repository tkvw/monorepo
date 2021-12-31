# @Tkvw\rxjs-apollo

Use the apollo client as a 
Usage
```ts
import { rxQuery } from "@tkvw/rxjs-apollo"
import { of, BehaviourSubject } from "rxjs";
import { ApolloClient } from "@apollo/client/core";

const variables = new BehaviourSubject();

const response = of(new ApolloClient())
    .pipe(rxQuery(variables));

const items = response.pipe(map(({data})=> data.cd.items));

```