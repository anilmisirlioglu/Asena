import Raffle, { IRaffle } from '../../../models/Raffle'
import pubsub from '../../../utils/PubSub'
import { MutationType } from '../../../types/ResolverTypes'
import { ErrorCodes } from '../../../utils/ErrorCodes'
import { RaffleMutationReturnType } from '../../../types/raffle/MutationReturnTypes'
import { Constants } from '../../../Constants';
import MutationReturnType from '../../../types/ReturnTypes';

export const RaffleMutations: MutationType = {
    createRaffle: async(parent, { data }): Promise<RaffleMutationReturnType> => {
        const {
            prize,
            server_id,
            constituent_id,
            channel_id,
            numbersOfWinner,
            finishAt
        }: {
            prize: string
            server_id: string
            constituent_id: string
            channel_id: string
            numbersOfWinner: number
            finishAt: Date
        } = data;

        const search: IRaffle[] = await Raffle.find({
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
    setRaffleMessageID: async(parent, { data }): Promise<MutationReturnType> => {
        const {
            raffle_id,
            message_id
        }: {
            raffle_id: string
            message_id: string
        } = data

        await Raffle.findByIdAndUpdate(raffle_id, {
            message_id
        })

        return {
            errorCode: ErrorCodes.SUCCESS
        }
    },
    deleteRaffle: async(parent, { data }): Promise<MutationReturnType> => {
        const { raffle_id }: { raffle_id: string } = data
        await Raffle.findByIdAndDelete(raffle_id);

        return {
            errorCode: ErrorCodes.SUCCESS
        }
    },
    cancelRaffle: async(parent, { data }): Promise<RaffleMutationReturnType> => {
        const { message_id }: { message_id: string } = data
        const raffle: IRaffle | undefined = await Raffle.findOne({
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
    },
    finishEarlyRaffle: async(parent, { data }): Promise<RaffleMutationReturnType> => {
        const { message_id }: { message_id: string } = data
        const raffle: IRaffle | undefined = await Raffle.findOne({
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

        await raffle.updateOne({ status: 'FINISHED' })
        await pubsub.publish(Constants.SUBSCRIPTIONS.ON_RAFFLE_FINISHED, {
            onRaffleFinished: raffle
        })

        return {
            raffle,
            errorCode: ErrorCodes.SUCCESS
        }
    }
}