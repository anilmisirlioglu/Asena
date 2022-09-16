import Command, { Group, Result } from '../Command';
import SuperClient from '../../SuperClient';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import Server from '../../structures/Server';
import { URLMap } from '../../Constants'

export default class Invitation extends Command{

    constructor(){
        super({
            name: 'invite',
            group: Group.BOT,
            description: 'commands.bot.invitation.description',
            permission: undefined,
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, action: ChatInputCommandInteraction): Promise<Result>{
        const embed = new EmbedBuilder()
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.avatarURL()
            })
            .setDescription([
                `:link: ${server.translate('commands.bot.invitation.bot.url')}: **[${server.translate('commands.bot.invitation.click.invite')}](${URLMap.INVITE})**`,
                `:technologist: ${server.translate('commands.bot.invitation.support.server')}: **[${server.translate('commands.bot.invitation.click.join')}](${URLMap.SUPPORT_SERVER})**`,
                `:satellite_orbital: ${server.translate('commands.bot.invitation.website')}: **[asena.xyz](${URLMap.WEBSITE}) - [wiki.asena.xyz](${URLMap.WIKI})**`,
                `:ringed_planet: ${server.translate('commands.bot.invitation.vote')}: **[${server.translate('commands.bot.invitation.click.vote')}](${URLMap.VOTE})**`,
                `:star2: ${server.translate('commands.bot.invitation.open.source')}: **[GitHub](${URLMap.GITHUB})**`
            ].join('\n'))
            .setColor(action.guild.members.me.displayHexColor)

        await action.reply({ embeds: [embed] })
        return null
    }

}
