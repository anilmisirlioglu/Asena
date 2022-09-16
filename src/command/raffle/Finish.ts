import { ChatInputCommandInteraction, CommandInteraction, PermissionsBitField } from 'discord.js'
import Command, { Group, Result } from '../Command'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class Finish extends Command{

    constructor(){
        super({
            name: 'finish',
            group: Group.GIVEAWAY,
            description: 'commands.raffle.end.description',
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
            return this.error('commands.raffle.end.not.found')
        }

        if(!raffle.isContinues()){
            return this.error('commands.raffle.end.not.continues')
        }

        await Promise.all([
            raffle.finish(client),
            action.reply(server.translate('commands.raffle.end.success', raffle.prize, `<#${raffle.channel_id}>`))
        ])

        return null
    }
}
