const { withFilter } = require('apollo-server-express')
const { Constants } = require('./../../../Constants')

module.exports = {
    onRaffleFinished: {
        subscribe: withFilter(
            (parent, args, { pubsub }) => pubsub.asyncIterator(Constants.SUBSCRIPTIONS.ON_RAFFLE_FINISHED),
            (payload, args) => {
                return true;
            }
        )
    }
}