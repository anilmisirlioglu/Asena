import Command, { Group } from '../Command';
import { CommandInteraction } from 'discord.js';
import Server from '../../structures/Server';
import SuperClient from '../../SuperClient';
import { validateRaffleText } from '../../utils/Utils';

export default class FixRaffle extends Command{

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
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.fix.not.found'))]
            })

            return true
        }

        if(raffle.status !== 'FINISHED'){
            await action.reply({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.fix.not.finished'))]
            })

            return true
        }

        const fetch = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if(!fetch){
            await action.reply({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.fix.timeout'))]
            })

            return true
        }

        if(!validateRaffleText(server, fetch.content)){
            await action.reply({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.fix.no.error'))]
            })

            return true
        }

        await Promise.all([
            raffle.finish(client),
            action.reply(server.translate('commands.raffle.fix.success', raffle.prize, `<#${raffle.channel_id}>`))
        ])

        return true
    }

}
