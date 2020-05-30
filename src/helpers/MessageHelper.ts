import {
    Client,
    Guild,
    GuildChannel,
    Message,
    Snowflake,
    TextChannel
} from 'discord.js'
import { Helper } from './Helper'

export class MessageHelper<C extends Client> extends Helper<C>{

    public fetchMessage<T extends Snowflake>(guildId: T, channelId: T, messageId: T): Promise<Message | undefined>{
        const guild: Guild = this.getClient().guilds.cache.get(guildId)
        if(guild){
            const channel: GuildChannel = guild.channels.cache.get(channelId)
            if(channel instanceof TextChannel){
                return channel.messages.fetch(messageId)
            }
        }

        return undefined
    }

}