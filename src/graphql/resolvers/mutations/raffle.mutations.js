const { ErrorCodes } = require('./../../../utils/ErrorCodes');

module.exports = {
    createRaffle: async(
        parent,
        { data: { prize, server_id, constituent_id, channel_id, numbersOfWinner, finishAt } },
        { Raffle }
    ) => {
        const search = await Raffle.find({
            server_id,
            status: 'CONTINUES'
        })

        if(search.length >= 3){
            return {
                raffle: null,
                errorCode: ErrorCodes.EXCEEDS_THE_RAFFLE_MAXIMUM_LIMIT
            }
        }

        const raffle = await Raffle.create({
            prize,
            server_id,
            constituent_id,
            channel_id,
            numbersOfWinner,
            status: 'CONTINUES',
            finishAt
        })

        return {
            raffle,
            errorCode: ErrorCodes.SUCCESS
        }
    },
    setRaffleMessageID: async(parent, { data: { raffle_id, message_id } }, { Raffle }) => {
        await Raffle.findByIdAndUpdate(raffle_id, {
            message_id
        })

        return {
            errorCode: ErrorCodes.SUCCESS
        }
    },
    deleteRaffle: async(parent, { data: { raffle_id } }, { Raffle }) => {
        await Raffle.findByIdAndDelete(raffle_id);

        return {
            errorCode: ErrorCodes.SUCCESS
        }
    },
    cancelRaffle: async(parent, { data: { message_id } }, { Raffle }) => {
        const raffle = await Raffle.findOne({
            message_id
        })

        if(!raffle){
            return {
                raffle: null,
                errorCode: ErrorCodes.NOT_FOUND
            }
        }

        if(raffle.status !== 'CONTINUES'){
            return {
                raffle: null,
                errorCode: ErrorCodes.RAFFLE_FINISHED_ERROR
            }
        }

        await raffle.updateOne({
            status: 'CANCELED'
        })

        return {
            raffle,
            errorCode: ErrorCodes.SUCCESS
        }
    }
}
