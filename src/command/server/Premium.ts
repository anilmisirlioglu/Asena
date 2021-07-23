import { Message, MessageEmbed } from 'discord.js'
import Command, { Group } from '../Command'
import SuperClient from '../../SuperClient'
import Server from '../../structures/Server'
import { parseDiscordTimestamp } from '../../utils/DateTimeHelper'
import { PremiumType } from '../../models/Premium'

export default class Premium extends Command{

    constructor(){
        super({
            name: 'premium',
            group: Group.SERVER,
            aliases: ['pre', 'p'],
            description: 'commands.server.premium.description',
            usage: null,
            permission: undefined,
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
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

        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor(`${client.user.username} Premium`, client.user.avatarURL())
            .setColor('LUMINOUS_VIVID_PINK')
            .setFooter(message.guild.name, message.guild.iconURL())
            .setDescription(description)

        await message.channel.send({ embed })
        return true
    }

}
