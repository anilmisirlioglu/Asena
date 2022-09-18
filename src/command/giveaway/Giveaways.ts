import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import Command, { Group, Result } from '../Command'
import { Emojis } from '../../Constants'
import { parseDiscordTimestamp } from '../../utils/DateTimeHelper'
import SuperClient from '../../SuperClient'
import Server from '../../structures/Server'
import { IGiveaway } from '../../models/Giveaway';

export default class Giveaways extends Command{

    constructor(){
        super({
            name: 'giveaways',
            group: Group.Giveaway,
            description: 'commands.giveaway.list.description',
            permission: undefined,
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, action: ChatInputCommandInteraction): Promise<Result>{
        const giveaways = await server.giveaways.getContinues()
        const embed = new EmbedBuilder()
            .setAuthor({ name: server.translate('commands.giveaway.list.embed.title') })
            .setColor('#DDA0DD')
            .setFooter({ text: action.guild.name })
            .setTimestamp()

        if(giveaways.length === 0){
            embed.setDescription(`${Emojis.CONFETTI_REACTION_EMOJI} ${server.translate('commands.giveaway.list.embed.description.active.not.found')}`)
        }else{
            let i: number = 1;
            giveaways.map(giveaway => {
                const data = {
                    creator: `<@${giveaway.constituent_id}>`,
                    channel: `<#${giveaway.channel_id}>`,
                    'winner.count': `**${giveaway.numberOfWinners}**`,
                    start: `**${parseDiscordTimestamp(giveaway.createdAt)}**`,
                    finish: `**${parseDiscordTimestamp(giveaway.finishAt)}**`,
                    giveaway: `**[${server.translate('commands.giveaway.list.click')}](${this.toDiscordMessageURL(giveaway)})**`
                }

                embed.addFields([
                    {
                        name: `${i++}. ${giveaway.prize}`,
                        value: Object.entries(data).map(([key, value]) => {
                            return `${server.translate(`commands.giveaway.list.embed.fields.${key}`)}: ${value}`
                        }).join('\n')
                    }
                ])
            })

            embed.setDescription(`${Emojis.CONFETTI_REACTION_EMOJI} ${server.translate('commands.giveaway.list.embed.description.active.found', giveaways.length)}`)
        }

        await action.reply({ embeds: [embed] })

        return null
    }

    private toDiscordMessageURL(giveaway: IGiveaway){
        return `https://discord.com/channels/${giveaway.server_id}/${giveaway.channel_id}/${giveaway.message_id}`
    }

}
