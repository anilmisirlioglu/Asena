import {
    Guild,
    GuildChannel,
    Snowflake
} from 'discord.js'
import Helper from './Helper'

export class ChannelHelper extends Helper{

    public fetchChannel<T extends Snowflake>(guildId: T, channelId: T): GuildChannel | undefined{
        const guild: Guild = this.getClient().guilds.cache.get(guildId)
        if(guild){
            return guild.channels.cache.get(channelId)
        }

        return undefined
    }

}