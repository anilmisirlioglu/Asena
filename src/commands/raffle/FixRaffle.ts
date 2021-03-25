import Command from '../Command';
import { Message } from 'discord.js';
import Server from '../../structures/Server';
import SuperClient from '../../SuperClient';
import { validateRaffleText } from '../../utils/Utils';

export default class FixRaffle extends Command{

    constructor(){
        super({
            name: 'fix',
            aliases: ['duzelt'],
            description: 'commands.raffle.fix.description',
            usage: 'global.message-id',
            permission: 'ADMINISTRATOR',
            examples: [
                '',
                '111111111111111111'
            ]
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const message_id: string | undefined = args[0]
        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.fix.not.found'))
            })

            return true
        }

        if(raffle.status !== 'FINISHED'){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.fix.not.finished'))
            })

            return true
        }

        const fetch = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if(!fetch){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.fix.timeout'))
            })

            return true
        }

        if(!validateRaffleText(fetch.content)){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.fix.no.error'))
            })

            return true
        }

        await Promise.all([
            raffle.finish(client, server),
            message.channel.send(server.translate('commands.raffle.fix.success', raffle.prize, `<#${raffle.channel_id}>`))
        ])
        if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
            await message.delete({
                timeout: 100
            })
        }

        return true
    }

}
