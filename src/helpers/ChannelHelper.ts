import {
    Client,
    Guild,
    GuildChannel,
    Snowflake
} from 'discord.js'
import Helper from './Helper'
import { SuperClient } from '../Asena';

export class ChannelHelper<C extends SuperClient> extends Helper<C>{

    public fetchChannel<T extends Snowflake>(guildId: T, channelId: T): GuildChannel | undefined{
        const guild: Guild = this.getClient().guilds.cache.get(guildId)
        if(guild){
            return guild.channels.cache.get(channelId)
        }

        return undefined
    }

}