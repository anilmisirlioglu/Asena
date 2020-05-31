module.exports = {
    getContinuesRaffles: async(parent, { server_id }, { Raffle }) => {
        return await Raffle.find({
            server_id,
            status: 'CONTINUES'
        })
    },
    searchRaffle: async(parent, { message_id }, { Raffle }) => {
        return Raffle.findOne({message_id});
    }
}