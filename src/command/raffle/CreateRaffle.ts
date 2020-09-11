import { Message } from 'discord.js'

import Command from '../Command'
import Constants, { RaffleLimits } from '../../Constants'
import SuperClient from '../../SuperClient';
import { IRaffle } from '../../models/Raffle';
import Server from '../../structures/Server';
import Raffle from '../../structures/Raffle';
import FlagValidator from '../../utils/FlagValidator';

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

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const validator = new FlagValidator(client, message)
        const numberOfWinners = args[0]
        const time: string = args[1]
        const prize: string[] = args.slice(2, args.length)

        if(time === undefined || prize.length === 0){
            return false
        }

        const flags = {
            numberOfWinners,
            prize: prize.join(' '),
            time
        }

        for(const [key, value] of Object.entries(flags)){
            const validate = await validator.validate(key, value)
            if(!validate.ok){
                await message.channel.send({
                    embed: this.getErrorEmbed(validate.message)
                })

                return true
            }

            flags[key] = validate.result
        }

        const max = RaffleLimits[`MAX_COUNT${server.isPremium() ? '_PREMIUM' : ''}`]
        const raffles = await server.raffles.getContinues()
        if(raffles.length >= max){
            await message.channel.send({
                embed: this.getErrorEmbed(`Maksimum çekiliş oluşturma sınırına ulaşmışsınız. (Max: ${max})`)
            })

            return true
        }

        const finishAt: number = Date.now() + (Number(flags.time) * 1000)
        const data = {
            prize: flags.prize,
            server_id: message.guild.id,
            constituent_id: message.author.id,
            channel_id: message.channel.id,
            numberOfWinners: Number(flags.numberOfWinners),
            status: 'CONTINUES',
            finishAt: new Date(finishAt)
        }

        const raffle = new Raffle(Object.assign({
            createdAt: new Date()
        }, data as IRaffle))

        message.channel.send(Raffle.getStartMessage(), {
            embed: raffle.buildEmbed()
        }).then(async $message => {
            await Promise.all([
                $message.react(Constants.CONFETTI_REACTION_EMOJI),
                server.raffles.create(Object.assign({
                    message_id: $message.id
                }, data) as IRaffle)
            ])

            if(raffle.isParticipationConditional()){
                await message.channel.send(raffle.buildTermOfParticipationText())
            }
        }).catch(async () => {
            await message.channel.send(':boom: Botun yetkileri, bu kanalda çekiliş oluşturmak için yetersiz olduğu için çekiliş başlatılamadı.')
        })

        if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
            await message.delete({
                timeout: 0
            })
        }

        return true
    }

}
