import {
    Client,
    Guild,
    GuildChannel,
    Message,
    MessageEmbed,
    Snowflake,
    TextChannel
} from 'discord.js'
import { Helper, SuperClient } from './Helper'

export class MessageHelper<C extends SuperClient> extends Helper<C>{

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

    public getErrorEmbed(error: string): MessageEmbed{
        return new MessageEmbed()
            .setAuthor(this.getClient().user.username, this.getClient().user.avatarURL())
            .setDescription(error)
            .setColor('RED')
    }

}