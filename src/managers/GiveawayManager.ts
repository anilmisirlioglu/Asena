import { Snowflake } from 'discord.js';
import GiveawayModel, { IGiveaway } from '../models/Giveaway';
import Giveaway, { SuperGiveaway } from '../structures/Giveaway'
import Server from '../structures/Server';
import Manager from './Manager';

export default class GiveawayManager extends Manager<Snowflake, Giveaway, typeof GiveawayModel, IGiveaway>{

    private readonly server: Server

    constructor(server: Server){
        super(GiveawayModel)

        this.server = server
    }

    protected key(): string{
        return 'message_id'
    }

    protected new(data: IGiveaway): Giveaway{
        return new Giveaway(data, this.server.locale)
    }

    public async getLastCreated(): Promise<Giveaway | undefined>{
        const search = await GiveawayModel
            .findOne({ server_id: this.server.identifier_id })
            .sort({ createdAt: -1 })

        if(!search) return undefined

        return this.setCacheFromRawDocument(search)
    }

    public async getContinues(): Promise<SuperGiveaway[]>{
        return GiveawayModel.find({
            server_id: this.server.server_id,
            $or: [
                { status: 'CONTINUES' },
                { status: 'ALMOST_DONE' }
            ]
        })
    }

}
