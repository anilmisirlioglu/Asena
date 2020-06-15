import { Snowflake } from 'discord.js';
import Raffle, { IRaffle } from '../models/Raffle';
import Manager from './Manager';

export default class RaffleManager extends Manager{

    public async getServerLastRaffle(guildId: Snowflake): Promise<IRaffle | undefined>{
        return Raffle
            .findOne({ server_id: guildId })
            .sort({ createdAt: -1 })
    }

}