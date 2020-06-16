import { Snowflake } from 'discord.js';
import Raffle, { IRaffle } from '../models/Raffle';
import Manager from './Manager';
import { ErrorCodes } from '../utils/ErrorCodes';

interface CreateRaffleOptions{
    prize: string
    server_id: string
    constituent_id: string
    channel_id: string
    numbersOfWinner: number
    finishAt: Date
}

interface Timestamps{
    createdAt?: Date
    updatedAt?: Date
}

interface ID{
    _id?: string
}

interface RaffleReturnType{
    raffle: SuperRaffle | undefined
    errorCode: ErrorCodes
}

type SuperRaffle = IRaffle & Timestamps & ID
type TRaffle = Promise<SuperRaffle | undefined>

export default class RaffleManager extends Manager{

    public async getServerLastRaffle(server_id: Snowflake): TRaffle{
        return Raffle
            .findOne({ server_id })
            .sort({ createdAt: -1 })
    }

    public async getContinuesRaffles(server_id: Snowflake): Promise<SuperRaffle[]>{
        return Raffle.find({
            server_id,
            $or: [
                { status: 'CONTINUES' },
                { status: 'ALMOST_DONE' }
            ]
        })
    }

    public async searchRaffle(message_id: Snowflake): TRaffle{
        return Raffle.findOne({ message_id })
    }

    public async createRaffle(options: CreateRaffleOptions): TRaffle{
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
        } = options;

        const search: IRaffle[] = await Raffle.find({
            server_id,
            status: 'CONTINUES'
        })

        if(search.length >= 3){
            return undefined
        }

        return Raffle.create({
            prize,
            server_id,
            constituent_id,
            channel_id,
            numbersOfWinner,
            status: 'CONTINUES',
            finishAt
        })
    }

    public async setRaffleMessageID(raffle_id: string, message_id: Snowflake): Promise<Boolean>{
        Raffle.findByIdAndUpdate(raffle_id, {
            message_id
        })

        return Promise.resolve(true)
    }

    public async deleteRaffle(raffle_id: string): Promise<Boolean>{
        Raffle.findByIdAndDelete(raffle_id)

        return Promise.resolve(true)
    }

    public async cancelRaffle(message_id: Snowflake): Promise<RaffleReturnType>{
        const raffle: IRaffle | undefined = await Raffle.findOne({
            message_id
        })

        if(!raffle){
            return {
                raffle: undefined,
                errorCode: ErrorCodes.NOT_FOUND
            }
        }

        if(raffle.status !== 'CONTINUES'){
            return {
                raffle: undefined,
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

    public async finishEarlyRaffle(message_id: Snowflake): Promise<RaffleReturnType>{
        const raffle: IRaffle | undefined = await Raffle.findOne({
            message_id
        })

        if(!raffle){
            return {
                raffle: undefined,
                errorCode: ErrorCodes.NOT_FOUND
            }
        }

        if(raffle.status !== 'CONTINUES'){
            return {
                raffle: undefined,
                errorCode: ErrorCodes.RAFFLE_FINISHED_ERROR
            }
        }

        await raffle.updateOne({
            status: 'FINISHED'
        })

        return {
            raffle,
            errorCode: ErrorCodes.SUCCESS
        }
    }

}