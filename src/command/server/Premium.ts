import { ChatInputCommandInteraction, Colors, EmbedBuilder } from 'discord.js'
import Command, { Group, Result } from '../Command'
import SuperClient from '../../SuperClient'
import Server from '../../structures/Server'
import { parseDiscordTimestamp } from '../../utils/DateTimeHelper'
import { PremiumType } from '../../models/Premium'

export default class Premium extends Command{

    constructor(){
        super({
            name: 'premium',
            group: Group.Server,
            description: 'commands.server.premium.description',
            permission: undefined,
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, action: ChatInputCommandInteraction): Promise<Result>{
        let description: string
        if(server.isPremium()){
            description = server.translate('commands.server.premium.info', ...[
                server.translate(`global.premium.${server.premium.humanizeType()}`),
                parseDiscordTimestamp(server.premium.startAt),
                server.premium.type === PremiumType.PERMANENT ? `${server.translate('global.unlimited')} ♾️` : parseDiscordTimestamp(server.premium.finishAt)
            ])
        }else{
            description = server.translate('commands.server.premium.try')
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user.username} Premium`,
                iconURL: client.user.avatarURL()
            })
            .setColor(Colors.LuminousVividPink)
            .setFooter({
                text: action.guild.name,
                iconURL: action.guild.iconURL()
            })
            .setDescription(description)

        await action.reply({ embeds: [embed] })
        return null
    }

}
