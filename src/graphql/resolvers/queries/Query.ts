import Raffle, { IRaffle } from '../../../models/Raffle'
import { QueryType } from '../../../types/ResolverTypes'

export const Query: QueryType = {
    getContinuesRaffles: async(parent, { server_id }: { server_id: string }): Promise<IRaffle[]> => {
        return Raffle.find({
            server_id,
            $or: [
                { status: 'CONTINUES' },
                { status: 'ALMOST_DONE' }
            ]
        })
    },
    searchRaffle: async(parent, { message_id }: { message_id: string }): Promise<IRaffle | null> => {
        return Raffle.findOne({ message_id })
    }
}