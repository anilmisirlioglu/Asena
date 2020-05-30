const { withFilter } = require('apollo-server-express')

module.exports = {
    onRaffleFinished: {
        subscribe: withFilter(
            (parent, args, { pubsub }) => pubsub.asyncIterator('ON_RAFFLE_FINISHED'),
            (payload, args) => {
                return true;
            }
        )
    }
}