import { Message } from 'discord.js'

import Command from '../Command'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

export default class EndRaffle extends Command{

    constructor(){
        super({
            name: 'end',
            aliases: ['hemenbitir', 'finish', 'bitir', 'erkenbitir'],
            description: 'commands.raffle.end.description',
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
                embed: this.getErrorEmbed(server.translate('commands.raffle.end.not.found'))
            })
            return true
        }

        if(!raffle.isContinues()){
            await message.channel.send({
                embed: this.getErrorEmbed(server.translate('commands.raffle.end.not.continues'))
            })
            return true
        }

        await Promise.all([
            raffle.finish(client),
            message.channel.send(server.translate('commands.raffle.end.success', raffle.prize, `<#${raffle.channel_id}>`))
        ])
        if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
            await message.delete({
                timeout: 100
            })
        }

        return true
    }
}
