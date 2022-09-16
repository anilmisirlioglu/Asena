import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import Command, { Group, Result } from '../Command'
import { Emojis } from '../../Constants'
import { parseDiscordTimestamp } from '../../utils/DateTimeHelper'
import SuperClient from '../../SuperClient'
import Server from '../../structures/Server'
import { IRaffle } from '../../models/Raffle';

export default class Raffles extends Command{

    constructor(){
        super({
            name: 'giveaways',
            group: Group.GIVEAWAY,
            description: 'commands.raffle.list.description',
            permission: undefined,
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, action: ChatInputCommandInteraction): Promise<Result>{
        const raffles = await server.raffles.getContinues()
        const embed = new EmbedBuilder()
            .setAuthor({ name: server.translate('commands.raffle.list.embed.title') })
            .setColor('#DDA0DD')
            .setFooter({ text: action.guild.name })
            .setTimestamp()

        if(raffles.length === 0){
            embed.setDescription(`${Emojis.CONFETTI_REACTION_EMOJI} ${server.translate('commands.raffle.list.embed.description.active.not.found')}`)
        }else{
            let i: number = 1;
            raffles.map(raffle => {
                const data = {
                    creator: `<@${raffle.constituent_id}>`,
                    channel: `<#${raffle.channel_id}>`,
                    'winner.count': `**${raffle.numberOfWinners}**`,
                    start: `**${parseDiscordTimestamp(raffle.createdAt)}**`,
                    finish: `**${parseDiscordTimestamp(raffle.finishAt)}**`,
                    giveaway: `**[${server.translate('commands.raffle.list.click')}](${this.toDiscordMessageURL(raffle)})**`
                }

                embed.setFields([
                    {
                        name: `${i++}. ${raffle.prize}`,
                        value: Object.entries(data).map(([key, value]) => {
                            return `${server.translate(`commands.raffle.list.embed.fields.${key}`)}: ${value}`
                        }).join('\n')
                    }
                ])
            })

            embed.setDescription(`${Emojis.CONFETTI_REACTION_EMOJI} ${server.translate('commands.raffle.list.embed.description.active.found', raffles.length)}`)
        }

        await action.reply({ embeds: [embed] })

        return null
    }

    private toDiscordMessageURL(raffle: IRaffle){
        return `https://discord.com/channels/${raffle.server_id}/${raffle.channel_id}/${raffle.message_id}`
    }

}
