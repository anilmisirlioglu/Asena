import { Message } from 'discord.js'

import Command from '../Command'
import Constants from '../../Constants'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class ReRollRaffle extends Command{

    constructor(){
        super({
            name: 'reroll',
            aliases: ['tekrarcek'],
            description: 'commands.raffle.reroll.description',
            usage: 'commands.raffle.reroll.usage',
            permission: 'ADMINISTRATOR',
            examples: [
                '',
                '1',
                '111111111111111111',
                '3 111111111111111111',
                '111111111111111111 3'
            ]
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        let message_id, count
        for(const arg of args){
            if(this.isValidSnowflake(arg)){
                if(message_id) return false

                message_id = arg.trim()
            }else if(this.isValidNumber(arg)){
                if(count) return false

                const parse = parseInt(arg)
                if(parse < 1){
                    await message.channel.send({
                        embed: this.getErrorEmbed(server.translate('commands.raffle.reroll.count.min'))
                    })

                    return true
                }

                count = parse
            }else return false
        }

        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.reroll.not.found'))
            })
            return true
        }

        if(raffle.status !== 'FINISHED'){
            await message.channel.send({
                embed: this.getErrorEmbed((raffle.status === 'CONTINUES' ? server.translate('commands.raffle.reroll.not.finish') : server.translate('commands.raffle.reroll.canceled')))
            })
            return true
        }

        let fetch: Message | undefined = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if(!fetch){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.reroll.timeout'))
            })

            return true
        }

        if(!fetch.reactions){
           fetch = await message.fetch()
            if(!fetch){
                await message.channel.send({
                    embed: this.getErrorEmbed(server.translate('commands.raffle.reroll.data.not.found'))
                })

                return true
            }
        }

        if(count && count > raffle.numbersOfWinner){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.reroll.count.max', raffle.numbersOfWinner))
            })

            return true
        }

        const winners = await raffle.identifyWinners(fetch, count)
        const _message = raffle.getMessageURL()
        if(winners.length === 0){
            await message.channel.send(server.translate('commands.raffle.reroll.not.enough', _message))
        }else{
            await message.channel.send(Constants.CONFETTI_EMOJI + ' ' + server.translate('commands.raffle.reroll.success', winners.map(winner => `<@${winner}>`).join(', '), raffle.prize, _message))
        }

        if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
            await message.delete({
                timeout: 100
            })
        }

        return true
    }

}
