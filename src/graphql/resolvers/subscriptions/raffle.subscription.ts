import { withFilter } from 'apollo-server-express'
import { Constants } from '../../../Constants'
import pubsub from '../../../utils/PubSub';

export const RaffleSubscriptions = {
    onRaffleFinished: {
        subscribe: withFilter(
            (parent, args) => pubsub.asyncIterator(Constants.SUBSCRIPTIONS.ON_RAFFLE_FINISHED),
            (payload, args) => {
                return true
            }
        )
    }
}