import { Message, TextChannel } from 'discord.js'

import Command from '../Command'
import Constants from '../../Constants'
import SuperClient from '../../SuperClient';
import { DateTimeHelper } from '../../helpers/DateTimeHelper';

export default class CreateRaffle extends Command{

    constructor(){
        super({
            name: 'create',
            aliases: ['çekilişoluştur', 'çekilişbaşlat', 'cekilisbaslat', 'createraffle'],
            description: 'Çekiliş oluşturur.',
            usage: '[kazanan sayısı<1 | 20>] [süre(1m | 5s) - [s(saniye) m(dakika) h(saat) d(gün)]] [ödül]',
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        const numbersOfWinner: number = Number(args[0])
        const time: string = args[1]
        const prize: string[] = args.slice(2, args.length)

        if(isNaN(numbersOfWinner) || time === undefined || prize.length === 0){
            return false
        }

        if(numbersOfWinner > Constants.MAX_RAFFLE_WINNER || numbersOfWinner === 0){
            await message.channel.send({
                embed: this.getErrorEmbed('Çekilişi kazanan üye sayısı maksimum 25, minimum 1 kişi olabilir.')
            })

            return true
        }

        const stringToPrize: string = prize.join(' ')
        if(stringToPrize.length > 255){
            await message.channel.send({
                embed: this.getErrorEmbed('Çekiliş başlığı maksimum 255 karakter uzunluğunda olmalıdır.')
            })

            return true
        }

        const toSecond: number = DateTimeHelper.detectTime(time);
        if(!toSecond){
            await message.channel.send({
                embed: this.getErrorEmbed('Lütfen geçerli bir süre giriniz. (Örn; **1s** - **1m** - **5m** - **1h** vb.)')
            })

            return true
        }

        if(toSecond < Constants.MIN_RAFFLE_TIME || toSecond > Constants.MAX_RAFFLE_TIME){
            await message.channel.send({
                embed: this.getErrorEmbed('Çekiliş süresi en az 1 dakika, en fazla 60 gün olabilir.')
            })

            return true
        }

        const finishAt: number = Date.now() + (toSecond * 1000)
        const createRaffle = await client.getRaffleManager().createRaffle({
            prize: stringToPrize,
            server_id: message.guild.id,
            constituent_id: message.author.id,
            channel_id: message.channel.id,
            numbersOfWinner,
            finishAt: new Date(finishAt)
        })

        if(!createRaffle){
            await message.channel.send({
                embed: this.getErrorEmbed('Maksimum çekiliş oluşturma sınırına ulaşmışsınız. (Max: 5)')
            })

            return true
        }

        await client.getRaffleHelper().sendRaffleStartMessage(
            message,
            message.channel as TextChannel,
            createRaffle
        )

        await message.delete({
            timeout: 0
        })

        return true
    }

}
