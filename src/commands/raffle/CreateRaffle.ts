import { Message } from 'discord.js'

import Command from '../Command'
import Constants from '../../Constants'
import SuperClient from '../../SuperClient';
import { decodeAndConvertTimeByUnit } from '../../utils/DateTimeHelper';
import { IRaffle } from '../../models/Raffle';
import Server from '../../structures/Server';
import Raffle from '../../structures/Raffle';

export default class CreateRaffle extends Command{

    constructor(){
        super({
            name: 'create',
            aliases: ['çekilişoluştur', 'çekilişbaşlat', 'cekilisbaslat', 'createraffle'],
            description: 'commands.raffle.create.description',
            usage: 'commands.raffle.create.usage',
            permission: 'ADMINISTRATOR',
            examples: [
                '1 1m Lorem Ipsum',
                '5 2h Test',
                '15 10d Premium'
            ]
        });
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const numbersOfWinner: number = Number(args[0])
        const time: string = args[1]
        const prize: string[] = args.slice(2, args.length)

        if(isNaN(numbersOfWinner) || time === undefined || prize.length === 0){
            return false
        }

        if(numbersOfWinner > Constants.MAX_RAFFLE_WINNER || numbersOfWinner === 0){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.create.limits.winner.count'))
            })

            return true
        }

        const stringToPrize: string = prize.join(' ')
        if(stringToPrize.length > 255){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.create.limits.title.length'))
            })

            return true
        }

        const toSecond: number = decodeAndConvertTimeByUnit(time);
        if(!toSecond){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.create.limits.time.invalid'))
            })

            return true
        }

        if(toSecond < Constants.MIN_RAFFLE_TIME || toSecond > Constants.MAX_RAFFLE_TIME){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.create.limits.time.exceeded'))
            })

            return true
        }

        const raffles = await server.raffles.getContinues()
        if(raffles.length > 5){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.create.limits.max.created'))
            })

            return true
        }

        const finishAt: number = Date.now() + (toSecond * 1000)
        const data = {
            prize: stringToPrize,
            server_id: message.guild.id,
            constituent_id: message.author.id,
            channel_id: message.channel.id,
            numbersOfWinner,
            status: 'CONTINUES',
            finishAt: new Date(finishAt)
        }

        const raffle = new Raffle(Object.assign({
            createdAt: new Date()
        }, data as IRaffle))

        message.channel.send(Raffle.getStartMessage(server), {
            embed: raffle.getEmbed(server)
        }).then(async $message => {
            await $message.react(Constants.CONFETTI_REACTION_EMOJI)

            await server.raffles.create(Object.assign({
                message_id: $message.id
            }, data) as IRaffle)
        }).catch(async () => {
            await message.channel.send(':boom: ' + server.translate('commands.raffle.create.unauthorized'))
        })

        if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
            await message.delete({
                timeout: 0
            })
        }

        return true
    }

}
