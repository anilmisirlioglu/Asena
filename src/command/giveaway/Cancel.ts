import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js'
import Command, { Group, Result } from '../Command'
import { Emojis } from '../../Constants'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class Cancel extends Command{

    constructor(){
        super({
            name: 'cancel',
            group: Group.Giveaway,
            description: 'commands.giveaway.cancel.description',
            permission: PermissionsBitField.Flags.Administrator,
            examples: [
                '',
                'message: 111111111111111111',
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: ChatInputCommandInteraction): Promise<Result>{
        const message_id: string | undefined = action.options.getString('giveaway', false)
        if(message_id && !this.isValidSnowflake(message_id)){
            return this.error('global.invalid.id')
        }

        const giveaway = await (message_id ? server.giveaways.get(message_id) : server.giveaways.getLastCreated())
        if(!giveaway || !giveaway.message_id){
            return this.error('commands.giveaway.cancel.not.found')
        }

        if(!giveaway.isCancelable()){
            return this.error('commands.giveaway.cancel.not.cancelable')
        }

        await giveaway.setCanceled()
        const $message = await client.fetchMessage(giveaway.server_id, giveaway.channel_id, giveaway.message_id)
        if($message){
            await $message.delete()
        }

        await action.reply(`${Emojis.CONFETTI_EMOJI} ${server.translate('commands.giveaway.cancel.success')}`)

        return null
    }

}
