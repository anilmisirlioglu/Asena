import {
    Client,
    Guild,
    GuildChannel,
    Snowflake
} from 'discord.js'
import { Helper, SuperClient } from './Helper'


export class ChannelHelper<G extends SuperClient> extends Helper<G>{

    public fetchChannel<T extends Snowflake>(guildId: T, channelId: T): GuildChannel | undefined{
        const guild: Guild = this.getClient().guilds.cache.get(guildId)
        if(guild){
            return guild.channels.cache.get(channelId)
        }

        return undefined
    }

}