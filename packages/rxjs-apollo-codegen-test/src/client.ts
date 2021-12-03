import {of} from "rxjs"
import {ApolloClient,InMemoryCache} from "@apollo/client/core"

export default of(new ApolloClient({
    cache: new InMemoryCache()
}))