import { Message, TextChannel } from 'discord.js'

import { Command } from '../Command'
import { Constants } from '../../Constants'
import { SuperClient } from '../../Asena';

export class CreateRaffle extends Command{

    constructor(){
        super({
            name: 'create',
            aliases: ['çekilişoluştur', 'çekilişbaşlat', 'cekilisbaslat', 'createraffle'],
            description: 'Çekiliş oluşturur.',
            usage: '[kazanan sayısı<1 | 20>] [süre] [süre tipi<m(dakika) | h(saat) | d(gün)>] [ödül]',
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        const numbersOfWinner: number = Number(args[0])
        const time: number = Number(args[1])
        const timeType: string = args[2] as string
        const prize: string[] = args.slice(3, args.length)

        if(isNaN(numbersOfWinner) || isNaN(time) || Constants.ALLOWED_TIME_TYPES.indexOf(timeType) === -1 || prize.length === 0){
            return Promise.resolve(false);
        }

        if(numbersOfWinner > Constants.MAX_WINNER || numbersOfWinner === 0){
            await message.channel.send({
                embed: client.helpers.message.getErrorEmbed('Çekilişi kazanan üye sayısı maksimum 25, minimum 1 kişi olabilir.')
            })

            return Promise.resolve(true)
        }

        const stringToPrize: string = prize.join(' ')
        if(stringToPrize.length > 255){
            await message.channel.send({
                embed: client.helpers.message.getErrorEmbed('Çekiliş başlığı maksimum 255 karakter uzunluğunda olmalıdır.')
            })

            return Promise.resolve(true)
        }

        let toSecond: number = 0;
        switch(timeType){
            case 'm':
            case 'dakika':
            case 'minute':
                toSecond = 60 * time
                break;

            case 'h':
            case 'saat':
            case 'hour':
                toSecond = 60 * 60 * time
                break;

            case 'd':
            case 'gün':
            case 'day':
                toSecond = ((60 * 60) * 24) * time
                break;
        }

        if(toSecond < Constants.MIN_TIME || toSecond > Constants.MAX_TIME){
            await message.channel.send({
                embed: client.helpers.message.getErrorEmbed('Çekiliş süresi en az 1 dakika, en fazla 60 gün olabilir.')
            })

            return Promise.resolve(true)
        }

        const finishAt: number = Date.now() + (toSecond * 1000)
        const createRaffle = await client.managers.raffle.createRaffle({
            prize: stringToPrize,
            server_id: message.guild.id,
            constituent_id: message.author.id,
            channel_id: message.channel.id,
            numbersOfWinner,
            finishAt: new Date(finishAt)
        })

        if(!createRaffle){
            await message.channel.send({
                embed: client.helpers.message.getErrorEmbed('Maksimum çekiliş oluşturma sınırına ulaşmışsınız. (Max: 5)')
            })

            return Promise.resolve(true)
        }

        await client.helpers.raffle.sendRaffleStartMessage(
            message,
            message.channel as TextChannel,
            toSecond,
            stringToPrize,
            numbersOfWinner,
            finishAt,
            createRaffle.id
        )

        await message.delete({
            timeout: 0
        })

        return Promise.resolve(true)
    }

}