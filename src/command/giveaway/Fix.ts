import Command, { Group, Result } from '../Command';
import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import Server from '../../structures/Server';
import SuperClient from '../../SuperClient';
import { validateGiveawayText } from '../../utils/Utils';

export default class Fix extends Command{

    constructor(){
        super({
            name: 'fix',
            group: Group.Giveaway,
            description: 'commands.giveaway.fix.description',
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
            return this.error('commands.giveaway.fix.not.found')
        }

        if(giveaway.status !== 'FINISHED'){
            return this.error('commands.giveaway.fix.not.finished')
        }

        const fetch = await client.fetchMessage(giveaway.server_id, giveaway.channel_id, giveaway.message_id)
        if(!fetch){
            return this.error('commands.giveaway.fix.timeout')
        }

        if(!validateGiveawayText(server, fetch.content)){
            return this.error('commands.giveaway.fix.no.error')
        }

        await Promise.all([
            giveaway.finish(client),
            action.reply(server.translate('commands.giveaway.fix.success', giveaway.prize, `<#${giveaway.channel_id}>`))
        ])

        return null
    }

}
