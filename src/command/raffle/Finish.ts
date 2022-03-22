import { CommandInteraction } from 'discord.js'
import Command, { Group } from '../Command'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class Finish extends Command{

    constructor(){
        super({
            name: 'finish',
            group: Group.GIVEAWAY,
            description: 'commands.raffle.end.description',
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
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.end.not.found'))]
            })
            return true
        }

        if(!raffle.isContinues()){
            await action.reply({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.end.not.continues'))]
            })
            return true
        }

        await Promise.all([
            raffle.finish(client),
            action.reply(server.translate('commands.raffle.end.success', raffle.prize, `<#${raffle.channel_id}>`))
        ])

        return true
    }
}
