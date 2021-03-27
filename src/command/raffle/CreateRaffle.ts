import { Message } from 'discord.js'

import Command from '../Command'
import { RaffleLimits, Emojis } from '../../Constants'
import SuperClient from '../../SuperClient';
import { IRaffle } from '../../models/Raffle';
import Server from '../../structures/Server';
import Raffle from '../../structures/Raffle';
import FlagValidator from '../../utils/FlagValidator';

export default class CreateRaffle extends Command{

    constructor(){
        super({
            name: 'create',
            aliases: ['cekilisbaslat', 'createraffle'],
            description: 'commands.raffle.create.description',
            usage: 'commands.raffle.create.usage',
            permission: 'ADMINISTRATOR',
            examples: [
                '1 1m Lorem Ipsum',
                '5 2m2h3s Test',
                '15 10d Premium'
            ]
        })
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
                    embed: this.getErrorEmbed(server.translate(validate.message, ...validate.args))
                })

                return true
            }

            flags[key] = validate.result
        }

        const max = RaffleLimits[`MAX_COUNT${server.isPremium() ? '_PREMIUM' : ''}`]
        const raffles = await server.raffles.getContinues()
        if(raffles.length >= max){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.create.limits.max.created', max)),
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
        }, data as IRaffle), server.locale)

        message.channel.send(Raffle.getStartMessage(), {
            embed: raffle.buildEmbed()
        }).then(async $message => {
            await server.raffles.create(Object.assign({
                message_id: $message.id
            }, data) as IRaffle)

            await $message.react(Emojis.CONFETTI_REACTION_EMOJI)
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
