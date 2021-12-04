import {ApolloClient, InMemoryCache} from "@apollo/client/core"
import { of } from "rxjs"

export default of(new ApolloClient({
    cache: new InMemoryCache(),
    uri: "https://api.spacex.land/graphql/"
}))