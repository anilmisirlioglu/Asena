import { Message } from 'discord.js'

import { Command } from '../Command'
import { ErrorCodes } from '../../utils/ErrorCodes';
import { SuperClient } from '../../Asena';

export class EndRaffle extends Command{

    constructor(){
        super({
            name: 'end',
            aliases: ['hemenbitir', 'finish', 'bitir', 'erkenbitir'],
            description: 'Çekilişi erken bitirir.',
            usage: null,
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        let message_id: string | undefined = args[0]

        if(!message_id){
            const raffle = await client.managers.raffle.getServerLastRaffle(message.guild.id)
            if(raffle){
                if(!raffle.message_id){
                    await message.channel.send({
                        embed: client.helpers.message.getErrorEmbed(`Bitirilebilecek bir çekiliş bulunamadı.`)
                    })

                    return true
                }

                message_id = raffle.message_id
            }
        }

        const finishEarlyRaffle = await client.managers.raffle.finishEarlyRaffle(message_id)
        if(finishEarlyRaffle.errorCode === ErrorCodes.NOT_FOUND){
            await message.channel.send({
                embed: client.helpers.message.getErrorEmbed('Çekiliş bulunamadı.')
            })

            return true
        }

        if(finishEarlyRaffle.errorCode === ErrorCodes.RAFFLE_FINISHED_ERROR){
            await message.channel.send({
                embed: client.helpers.message.getErrorEmbed('Anlaşılan bu çekiliş zaten bitmiş veya iptal edilmiş.')
            })

            return true
        }

        await message.channel.send(`**${finishEarlyRaffle.raffle.prize}** çekilişi erken bitirildi. Sonuçlar <#${finishEarlyRaffle.raffle.channel_id}> kanalına gönderildi.`)
        await message.delete({
            timeout: 100
        })

        return true
    }
}