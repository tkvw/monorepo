import {ApolloClient,InMemoryCache} from "@apollo/client/core/index.js"
import {of} from "rxjs"

export default of(new ApolloClient({
    cache: new InMemoryCache()
}))