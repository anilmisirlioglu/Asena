import Command, { Group } from '../Command';
import SuperClient from '../../SuperClient';
import { Message, MessageEmbed } from 'discord.js';
import Server from '../../structures/Server';
import { URLMap } from '../../Constants'

export default class Invitation extends Command{

    constructor(){
        super({
            name: 'invite',
            group: Group.BOT,
            aliases: ['davet', 'party', 'davetiye', 'link', 'wiki'],
            description: 'commands.bot.invitation.description',
            usage: null,
            permission: undefined,
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const embed = new MessageEmbed()
            .setAuthor(client.user.username, client.user.avatarURL())
            .setDescription([
                `:link: ${server.translate('commands.bot.invitation.bot.url')}: **[${server.translate('commands.bot.invitation.click.invite')}](${URLMap.INVITE})**`,
                `:technologist: ${server.translate('commands.bot.invitation.support.server')}: **[${server.translate('commands.bot.invitation.click.join')}](${URLMap.SUPPORT_SERVER})**`,
                `:satellite_orbital: ${server.translate('commands.bot.invitation.website')}: **[asena.xyz](${URLMap.WEBSITE}) - [wiki.asena.xyz](${URLMap.WIKI})**`,
                `:ringed_planet: ${server.translate('commands.bot.invitation.vote')}: **[${server.translate('commands.bot.invitation.click.vote')}](${URLMap.VOTE})**`,
                `:star2: ${server.translate('commands.bot.invitation.open.source')}: **[GitHub](${URLMap.GITHUB})**`
            ])
            .setColor(message.guild.me.displayHexColor)

        await message.channel.send({ embed })
        return true
    }

}
