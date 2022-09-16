import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js'
import Command, { Group, Result } from '../Command'
import { Emojis } from '../../Constants'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class Cancel extends Command{

    constructor(){
        super({
            name: 'cancel',
            group: Group.GIVEAWAY,
            description: 'commands.raffle.cancel.description',
            permission: PermissionsBitField.Flags.Administrator,
            examples: [
                '',
                'message: 111111111111111111',
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: ChatInputCommandInteraction): Promise<Result>{
        const message_id: string | undefined = action.options.getString('message', false)
        if(message_id && !this.isValidSnowflake(message_id)){
            return this.error('global.invalid.id')
        }

        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            return this.error('commands.raffle.cancel.not.found')
        }

        if(!raffle.isCancelable()){
            return this.error('commands.raffle.cancel.not.cancelable')
        }

        await raffle.setCanceled()
        const $message = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if($message){
            await $message.delete()
        }

        await action.reply(`${Emojis.CONFETTI_EMOJI} ${server.translate('commands.raffle.cancel.success')}`)

        return null
    }

}
