import { CommandInteraction } from 'discord.js'
import Command, { Group } from '../Command'
import { Emojis } from '../../Constants'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class CancelRaffle extends Command{

    constructor(){
        super({
            name: 'cancel',
            group: Group.GIVEAWAY,
            description: 'commands.raffle.cancel.description',
            permission: 'ADMINISTRATOR',
            examples: [
                '',
                'message: 111111111111111111',
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<boolean>{
        const message_id: string | undefined = action.options.getString('message', false)
        if(message_id && !this.isValidSnowflake(message_id)){
            await action.reply({
                embeds: [this.getErrorEmbed(server.translate('global.invalid.id'))]
            })
            return true
        }

        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            await action.reply({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.cancel.not.found'))]
            })
            return true
        }

        if(!raffle.isCancelable()){
            await action.reply({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.cancel.not.cancelable'))]
            })
            return true
        }

        await raffle.setCanceled()
        const $message = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if($message){
            await $message.delete()
        }

        await action.reply(`${Emojis.CONFETTI_EMOJI} ${server.translate('commands.raffle.cancel.success')}`)

        return true
    }

}
