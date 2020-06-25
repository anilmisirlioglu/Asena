import { Message } from 'discord.js'

import { Command } from '../Command'
import { ErrorCodes } from '../../utils/ErrorCodes';
import { SuperClient } from '../../Asena';

export default class EndRaffle extends Command{

    constructor(){
        super({
            name: 'end',
            aliases: ['hemenbitir', 'finish', 'bitir', 'erkenbitir'],
            description: 'Çekilişi erken bitirir.',
            usage: '[mesaj id]',
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        let message_id: string | undefined = args[0]

        if(!message_id){
            const raffle = await client.getRaffleManager().getServerLastRaffle(message.guild.id)
            if(raffle){
                if(!raffle.message_id){
                    await message.channel.send({
                        embed: this.getErrorEmbed(`Bitirilebilecek bir çekiliş bulunamadı.`)
                    })

                    return true
                }

                message_id = raffle.message_id
            }
        }

        const finishEarlyRaffle = await client.getRaffleManager().finishEarlyRaffle(message_id)
        if(finishEarlyRaffle.errorCode === ErrorCodes.NOT_FOUND){
            await message.channel.send({
                embed: this.getErrorEmbed('Çekiliş bulunamadı.')
            })

            return true
        }

        if(finishEarlyRaffle.errorCode === ErrorCodes.RAFFLE_FINISHED_ERROR){
            await message.channel.send({
                embed: this.getErrorEmbed('Anlaşılan bu çekiliş zaten bitmiş veya iptal edilmiş.')
            })

            return true
        }

        await client.getRaffleHelper().finishRaffle(finishEarlyRaffle.raffle)
        await message.channel.send(`**${finishEarlyRaffle.raffle.prize}** çekilişi erken bitirildi. Sonuçlar <#${finishEarlyRaffle.raffle.channel_id}> kanalına gönderildi.`)
        await message.delete({
            timeout: 100
        })

        return true
    }
}