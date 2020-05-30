module.exports = {
    getContinuesRaffles: async(parent, { server_id }, { Raffle }) => {
        return await Raffle.find({
            server_id,
            status: 'CONTINUES'
        })
    }
}