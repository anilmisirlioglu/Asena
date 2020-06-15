import {
    Guild,
    GuildChannel,
    Message,
    MessageEmbed,
    Snowflake,
    TextChannel
} from 'discord.js'
import Helper from './Helper'
import { Command } from '../commands/Command'

export class MessageHelper extends Helper{

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
            .setAuthor(this.client.user.username, this.client.user.avatarURL())
            .setDescription(error)
            .setColor('RED')
    }

    public getCommandUsageEmbed(command: Command): MessageEmbed{
        return new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.avatarURL())
            .setDescription(`Kullanımı: **${this.client.prefix}${command.getName()} ${command.getUsage()}**`)
            .setColor('GOLD');
    }

}