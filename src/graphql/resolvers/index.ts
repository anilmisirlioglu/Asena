import { Subscription } from './subscriptions'
import { Mutation } from './mutations'
import { Query } from './queries/Query'

const resolvers = {
    Subscription,
    Mutation,
    Query
}

export default resolvers
export { resolvers }