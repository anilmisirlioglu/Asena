import { Message, MessageEmbed } from 'discord.js'

import Command from '../Command'
import Constants from '../../Constants'
import { getDateTimeToString } from '../../utils/DateTimeHelper'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class Raffles extends Command{

    public constructor(){
        super({
            name: 'raffles',
            aliases: ['çekilişler', 'aktifçekilişler', 'cekilisler', 'activeraffles', 'list'],
            description: 'commands.raffle.list.description',
            usage: null,
            permission: undefined,
            examples: []
        });
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const raffles = await server.raffles.getContinues()
        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor(`${message.guild.name} | ${server.translate('commands.raffle.list.embed.title')}`)
            .setColor('#DDA0DD')
            .setFooter(`${message.guild.name} ${server.translate('commands.raffle.list.embed.footer')}`)
            .setTimestamp()

        if(raffles.length === 0){
            embed.setDescription(`${Constants.CONFETTI_REACTION_EMOJI} ${server.translate('commands.raffle.list.embed.description.active.not.found')}`)
        }else{
            let i: number = 1;
            raffles.map(raffle => {
                const data = {
                    creator: `<@${raffle.constituent_id}>`,
                    channel: `<#${raffle.channel_id}>`,
                    'winner.count': `**${raffle.numbersOfWinner}**`,
                    start: `**${getDateTimeToString(new Date(raffle.createdAt), server.locale)}** (UTC)`,
                    finish: `**${getDateTimeToString(new Date(raffle.finishAt), server.locale)}** (UTC)`
                }

                embed.addField(`${i++}. ${raffle.prize}`, Object.entries(data).map(([key, value]) => {
                    return `${server.translate(`commands.raffle.list.embed.fields.${key}`)}: ${value}`
                }))
            })

            embed.setDescription(`${Constants.CONFETTI_REACTION_EMOJI} ${server.translate('commands.raffle.list.embed.description.active.found', raffles.length)}`)
        }

        await message.channel.send({ embed })

        return true
    }

}
