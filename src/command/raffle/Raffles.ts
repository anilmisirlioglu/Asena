import { Message, MessageEmbed } from 'discord.js'
import Command from '../Command'
import { Emojis } from '../../Constants'
import { getDateTimeToString } from '../../utils/DateTimeHelper'
import SuperClient from '../../SuperClient'
import Server from '../../structures/Server'

export default class Raffles extends Command{

    public constructor(){
        super({
            name: 'raffles',
            aliases: ['çekilişler', 'aktifçekilişler', 'cekilisler', 'activeraffles', 'list'],
            description: 'Sunucudaki aktif  çekilişleri listeler',
            usage: null,
            permission: undefined
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const raffles = await server.raffles.getContinues()
        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor(`${message.guild.name} | Aktif Çekilişler`)
            .setColor('#DDA0DD')
            .setFooter(`${message.guild.name} Çekilişler`)
            .setTimestamp()

        if(raffles.length === 0){
            embed.setDescription(`${Emojis.CONFETTI_REACTION_EMOJI} Aktif devam eden herhangi bir çekiliş bulunmuyor.`)
        }else{
            let i: number = 1;
            raffles.map(raffle => {
                embed.addField(`${i++}. ${raffle.prize}`, [
                    `Oluşturan: <@${raffle.constituent_id}>`,
                    `Kanal: <#${raffle.channel_id}>`,
                    `Kazanan Sayısı: **${raffle.numberOfWinners} Kişi**`,
                    `Başlangıç Tarihi: **${getDateTimeToString(new Date(raffle.createdAt))}** (UTC)`,
                    `Bitiş Tarihi: **${getDateTimeToString(new Date(raffle.finishAt))}** (UTC)`
                ])
            })
            embed.setDescription(`${Emojis.CONFETTI_REACTION_EMOJI} Toplam **${raffles.length}** aktif çekiliş var`)
        }

        await message.channel.send({ embed })

        return true
    }

}
