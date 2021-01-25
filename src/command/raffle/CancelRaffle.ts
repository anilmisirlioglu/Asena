import { Message } from 'discord.js'

import Command from '../Command'
import { Emojis } from '../../Constants'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class CancelRaffle extends Command{

    constructor(){
        super({
            name: 'cancel',
            aliases: ['çekilişiptalet', 'çekilişiiptalet', 'cekilisiptal', 'çekilişiptal', 'cancelraffle'],
            description: 'commands.raffle.cancel.description',
            usage: 'general.message-id',
            permission: 'ADMINISTRATOR'
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        let message_id: string | undefined = args[0]

        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.cancel.not.found'))
            })
            return true
        }

        if(!raffle.isCancelable()){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.cancel.not.cancelable'))
            })
            return true
        }

        await raffle.setCanceled()

        const $message = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if($message){
            await $message.delete({
                timeout: 0
            })
        }

        await message.channel.send(`${Emojis.CONFETTI_EMOJI} ${server.translate('commands.raffle.cancel.success')}`)
        if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
            await message.delete({
                timeout: 0
            })
        }

        return true
    }

}
