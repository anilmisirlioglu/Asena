import { Snowflake } from 'discord.js';
import RaffleModel, { IRaffle } from '../models/Raffle';
import Raffle from '../structures/Raffle'
import Timestamps from '../models/legacy/Timestamps';
import ID from '../models/legacy/ID';
import Server from '../structures/Server';
import Manager from './Manager';

type SuperRaffle = IRaffle & Timestamps & ID

export default class RaffleManager extends Manager<Snowflake, Raffle, typeof RaffleModel, IRaffle>{

    private readonly server: Server

    constructor(server: Server){
        super(RaffleModel)

        this.server = server
    }

    protected key(): string{
        return 'message_id'
    }

    protected new(data: IRaffle): Raffle{
        return new Raffle(data)
    }

    public async getLastCreated(): Promise<Raffle | undefined>{
        const search = await RaffleModel
            .findOne({ server_id: this.server.identifier_id })
            .sort({ createdAt: -1 })

        if(search){
            const raffle = this.new(search)
            this.set(raffle.identifier_id, raffle)

            return raffle
        }

        return undefined
    }

    public async getContinues(): Promise<SuperRaffle[]>{
        return RaffleModel.find({
            server_id: this.server.server_id,
            $or: [
                { status: 'CONTINUES' },
                { status: 'ALMOST_DONE' }
            ]
        })
    }

}
