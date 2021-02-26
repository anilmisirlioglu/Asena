import { Message } from 'discord.js'

import Command from '../Command'
import { Emojis } from '../../Constants'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class ReRollRaffle extends Command{

    constructor(){
        super({
            name: 'reroll',
            aliases: ['tekrarçek'],
            description: 'commands.raffle.reroll.description',
            usage: 'global.message-id',
            permission: 'ADMINISTRATOR',
            examples: [
                '',
                '111111111111111111'
            ]
        });
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        let message_id: string | undefined = args[0]

        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.reroll.not.found'))
            })
            return true
        }

        if(raffle.status !== 'FINISHED'){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.reroll.' + (raffle.status === 'CONTINUES' ? 'not.finish' : 'canceled')))
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

        const winners = await raffle.identifyWinners(fetch)
        const _message = raffle.getMessageURL()
        if(winners.length === 0){
            await message.channel.send(server.translate('commands.raffle.reroll.not.enough', _message))
        }else{
            if(raffle.rewardRoles.length > 0 && !message.guild.me.hasPermission('MANAGE_ROLES')){
                await message.channel.send(server.translate('commands.raffle.reroll.unauthorized'))

                return true
            }

            await Promise.all([
                message.channel.send(Emojis.CONFETTI_EMOJI + ' ' + server.translate('commands.raffle.reroll.success', winners.map(winner => `<@${winner}>`).join(', '), raffle.prize, _message)),
                new Promise(async () => {
                    if(raffle.winners.length > 0){
                        const promises: Promise<unknown>[] = raffle.winners.map(winner => new Promise(() => {
                            message.guild.members.fetch(winner).then(async user => {
                                if(user){
                                    await user.roles.remove(raffle.rewardRoles)
                                }
                            })
                        }))

                        await Promise.all(promises)
                    }
                }),
                raffle.resolveWinners(client, message.guild, winners)
            ])
        }

        if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
            await message.delete({
                timeout: 100
            })
        }

        return true
    }

}
