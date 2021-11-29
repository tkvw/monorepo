Usage
```ts
import { query } from "@tkvw/rxjs-apollo"
import { of, BehaviourSubject } from "rxjs";
import { ApolloClient } from "@apollo/client/core";

const variables = new BehaviourSubject();

const response = of(new ApolloClient())
    .pipe(query(variables));

const items = response.pipe(map(({data})=> data.cd.items));



    
```