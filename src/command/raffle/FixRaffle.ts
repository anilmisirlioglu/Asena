import Command, { Group } from '../Command';
import { Message } from 'discord.js';
import Server from '../../structures/Server';
import SuperClient from '../../SuperClient';
import { validateRaffleText } from '../../utils/Utils';

export default class FixRaffle extends Command{

    constructor(){
        super({
            name: 'fix',
            group: Group.GIVEAWAY,
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
        if(message_id && !this.isValidSnowflake(message_id)){
            await message.channel.send({
                embeds: [this.getErrorEmbed(server.translate('global.invalid.id'))]
            })
            return true
        }

        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            await message.channel.send({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.fix.not.found'))]
            })

            return true
        }

        if(raffle.status !== 'FINISHED'){
            await message.channel.send({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.fix.not.finished'))]
            })

            return true
        }

        const fetch = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if(!fetch){
            await message.channel.send({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.fix.timeout'))]
            })

            return true
        }

        if(!validateRaffleText(server, fetch.content)){
            await message.channel.send({
                embeds: [this.getErrorEmbed(server.translate('commands.raffle.fix.no.error'))]
            })

            return true
        }

        await Promise.all([
            raffle.finish(client),
            message.channel.send(server.translate('commands.raffle.fix.success', raffle.prize, `<#${raffle.channel_id}>`))
        ])

        if(message.guild.me.permissions.has('MANAGE_MESSAGES')){
            await message.delete()
        }

        return true
    }

}
