import { MessageEmbed } from 'discord.js'
import Helper from './Helper';
import { Command } from '../commands/Command'

export class MessageHelper extends Helper{

    public getErrorEmbed(error: string): MessageEmbed{
        return new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.avatarURL())
            .setDescription(error)
            .setColor('RED')
    }

    public getCommandUsageEmbed(command: Command): MessageEmbed{
        return new MessageEmbed()
            .setAuthor(this.client.user.username, this.client.user.avatarURL())
            .setDescription(`Kullanımı: **${this.client.prefix}${command.name} ${command.usage}**`)
            .setColor('GOLD');
    }

}