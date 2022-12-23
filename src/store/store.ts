import { InMemoryCache, ApolloClient } from '@apollo/client'
import localForage from 'localforage'

const cache = new InMemoryCache()
const apolloClient = new ApolloClient({ cache })

const persistedStore = localForage.createInstance({
  name: 'tontech',
})

export { apolloClient, persistedStore }
