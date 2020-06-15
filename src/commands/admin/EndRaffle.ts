import { Message } from 'discord.js'

import { Command } from '../Command'
import call from '../../utils/call'
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

        const FINISH_EARLY_RAFFLE = `
            mutation($message_id: String!){
                finishEarlyRaffle(data: {
                    message_id: $message_id
                }){
                    raffle{
                        id
                        prize
                        channel_id
                        constituent_id
                        message_id
                        server_id
                        numbersOfWinner
                        status
                        finishAt
                    }
                    errorCode
                }
            }
        `

        const result = await call({
            source: FINISH_EARLY_RAFFLE,
            variableValues: {
                message_id
            }
        })
        const finishEarlyRaffle = result.data.finishEarlyRaffle
        const errorCode = finishEarlyRaffle.errorCode

        if(errorCode === ErrorCodes.NOT_FOUND){
            await message.channel.send({
                embed: client.helpers.message.getErrorEmbed('Çekiliş bulunamadı.')
            })

            return true
        }

        if(errorCode === ErrorCodes.RAFFLE_FINISHED_ERROR){
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