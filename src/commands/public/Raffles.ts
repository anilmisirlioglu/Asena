import { Message, MessageEmbed } from 'discord.js'

import { Command } from '../Command'
import { Constants } from '../../Constants'
import { DateTimeHelper } from '../../helpers/DateTimeHelper'
import call from '../../utils/call'
import { SuperClient } from '../../helpers/Helper';

export class Raffles extends Command{

    public constructor(){
        super(
            'raffles',
            ['çekilişler', 'aktifçekilişler', 'cekilisler', 'activeraffles', 'list'],
            'Sunucudaki aktif  çekilişleri listeler',
            null,
            undefined
        );
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        const CONTINUES_RAFFLES = `
            query($server_id: String!){
                getContinuesRaffles(server_id: $server_id){
                    id
                    prize
                    message_id
                    server_id
                    constituent_id
                    channel_id
                    numbersOfWinner
                    status
                    finishAt
                    createdAt
                }
            }
        `;

        const result = await call({
            source: CONTINUES_RAFFLES,
            variableValues: {
                server_id: message.guild.id
            }
        })

        const raffles = result.data.getContinuesRaffles;
        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor(`${message.guild.name} | Aktif Çekilişler`)
            .setColor('#DDA0DD')
            .setFooter(`${message.guild.name} Çekilişler`)
            .setTimestamp()

        if(raffles.length === 0){
            embed.setDescription(`${Constants.CONFETTI_REACTION_EMOJI} Aktif devam eden herhangi bir çekiliş bulunmuyor.`)
        }else{
            let i: number = 1;
            raffles.map(raffle => {
                embed.addField(`${i++}. ${raffle.prize}`, `Oluşturan: <@${raffle.constituent_id}>\nKanal: <#${raffle.channel_id}>\nKazanan Sayısı: **${raffle.numbersOfWinner} Kişi**\nBaşlangıç Tarihi: **${DateTimeHelper.getDateTimeToString(new Date(raffle.createdAt))}**\nBitiş: **${DateTimeHelper.getDateTimeToString(new Date(raffle.finishAt))}**`)
            })
            embed.setDescription(`${Constants.CONFETTI_REACTION_EMOJI} Toplam **${raffles.length}** aktif çekiliş var`)
        }

        await message.channel.send({ embed })

        return true
    }

}