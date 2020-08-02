import { Message } from 'discord.js'

import Command from '../Command'
import Constants from '../../Constants'
import { ErrorCodes } from '../../utils/ErrorCodes';
import SuperClient from '../../SuperClient';

export default class CancelRaffle extends Command{

    constructor(){
        super({
            name: 'cancel',
            aliases: ['çekilişiptalet', 'çekilişiiptalet', 'cekilisiptal', 'çekilişiptal', 'cancelraffle'],
            description: 'Var olan bir çekilişi bitirir.',
            usage: '[mesaj id]',
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        let message_id: string | undefined = args[0];

        if(!message_id){
            const raffle = await client.getRaffleManager().getServerLastRaffle(message.guild.id)
            if(raffle){
                if(!raffle.message_id){
                    await message.channel.send({
                        embed: this.getErrorEmbed(`İptal edilebilecek bir çekiliş bulunamadı.`)
                    })

                    return true
                }

                message_id = raffle.message_id
            }
        }

        const cancelRaffle = await client.getRaffleManager().cancelRaffle(message_id)
        if(cancelRaffle.errorCode === ErrorCodes.NOT_FOUND){
            await message.channel.send({
                embed: this.getErrorEmbed('Çekiliş bulunamadı.')
            })

            return true
        }

        if(cancelRaffle.errorCode === ErrorCodes.RAFFLE_FINISHED_ERROR){
            await message.channel.send({
                embed: this.getErrorEmbed('Bu çekiliş devam eden bir çekiliş değil. Bu komut sadece devam eden çekilişlerde kullanılabilir.')
            })

            return true
        }

        const raffle = cancelRaffle.raffle
        const $message = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if($message){
            await $message.delete({
                timeout: 0
            })
        }
        await message.channel.send(`${Constants.CONFETTI_EMOJI} Çekiliş başarıyla iptal edildi.`)

        await message.delete({
            timeout: 0
        })

        return true;
    }

}
