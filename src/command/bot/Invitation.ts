import Command from '../Command';
import SuperClient from '../../SuperClient';
import { Message, MessageEmbed } from 'discord.js';
import Server from '../../structures/Server';
import { Bot } from '../../Constants'

export default class Invitation extends Command{

    constructor(){
        super({
            name: 'davet',
            aliases: ['invite', 'party', 'davetiye', 'link'],
            description: 'commands.bot.invitation.description',
            usage: null,
            permission: undefined,
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const embed = new MessageEmbed()
            .setAuthor(SuperClient.NAME, SuperClient.AVATAR)
            .addField(`:rainbow:  **${server.translate('commands.bot.invitation.bot.url')}:**`, `[${server.translate('commands.bot.invitation.click.invite')}](${Bot.INVITE_URL})`)
            .addField(`<:hayalet:739432632030593105>  **${server.translate('commands.bot.invitation.support.server')}:**`, `[${server.translate('commands.bot.invitation.click.join')}](${Bot.SUPPORT_SERVER})`)
            .addField(`:earth_americas:  **${server.translate('commands.bot.invitation.website')}:**`, `[asena.xyz](${Bot.WEBSITE})`)
            .setColor(message.guild.me.displayHexColor)

        await message.channel.send({ embed })
        return true
    }

}
