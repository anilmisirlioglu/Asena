import { Message, MessageEmbed } from 'discord.js'

import Command from '../Command'
import Constants from '../../Constants'
import { getDateTimeToString } from '../../helpers/DateTimeHelper'
import SuperClient from '../../SuperClient';

export default class Raffles extends Command{

    public constructor(){
        super({
            name: 'raffles',
            aliases: ['çekilişler', 'aktifçekilişler', 'cekilisler', 'activeraffles', 'list'],
            description: 'Sunucudaki aktif  çekilişleri listeler',
            usage: null,
            permission: undefined
        });
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        const raffles = await client.getRaffleManager().getContinuesRaffles(message.guild.id);
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
                embed.addField(`${i++}. ${raffle.prize}`, `Oluşturan: <@${raffle.constituent_id}>\nKanal: <#${raffle.channel_id}>\nKazanan Sayısı: **${raffle.numbersOfWinner} Kişi**\nBaşlangıç Tarihi: **${getDateTimeToString(new Date(raffle.createdAt))}**\nBitiş: **${getDateTimeToString(new Date(raffle.finishAt))}**`)
            })
            embed.setDescription(`${Constants.CONFETTI_REACTION_EMOJI} Toplam **${raffles.length}** aktif çekiliş var`)
        }

        await message.channel.send({ embed })

        return true
    }

}
