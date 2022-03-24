import Command, { Group, Result } from '../Command';
import { CommandInteraction } from 'discord.js';
import Server from '../../structures/Server';
import SuperClient from '../../SuperClient';
import { validateRaffleText } from '../../utils/Utils';

export default class Fix extends Command{

    constructor(){
        super({
            name: 'fix',
            group: Group.GIVEAWAY,
            description: 'commands.raffle.fix.description',
            permission: 'ADMINISTRATOR',
            examples: [
                '',
                'message: 111111111111111111',
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<Result>{
        const message_id: string | undefined = action.options.getString('message', false)
        if(message_id && !this.isValidSnowflake(message_id)){
            return this.error('global.invalid.id')
        }

        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            return this.error('commands.raffle.fix.not.found')
        }

        if(raffle.status !== 'FINISHED'){
            return this.error('commands.raffle.fix.not.finished')
        }

        const fetch = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if(!fetch){
            return this.error('commands.raffle.fix.timeout')
        }

        if(!validateRaffleText(server, fetch.content)){
            return this.error('commands.raffle.fix.no.error')
        }

        await Promise.all([
            raffle.finish(client),
            action.reply(server.translate('commands.raffle.fix.success', raffle.prize, `<#${raffle.channel_id}>`))
        ])

        return null
    }

}
