import { ChatInputCommandInteraction, PermissionsBitField } from 'discord.js'
import Command, { Group, Result } from '../Command'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class Finish extends Command{

    constructor(){
        super({
            name: 'finish',
            group: Group.Giveaway,
            description: 'commands.giveaway.end.description',
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
            return this.error('commands.giveaway.end.not.found')
        }

        if(!giveaway.isContinues()){
            return this.error('commands.giveaway.end.not.continues')
        }

        await Promise.all([
            giveaway.finish(client),
            action.reply(server.translate('commands.giveaway.end.success', giveaway.prize, `<#${giveaway.channel_id}>`))
        ])

        return null
    }
}
