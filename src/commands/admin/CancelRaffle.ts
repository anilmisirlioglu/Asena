import { Message, MessageEmbed } from 'discord.js'

import { Command } from '../Command'
import { Constants } from '../../Constants'
import call from '../../utils/call'
import { SuperClient } from '../../helpers/Helper';
import { ErrorCodes } from '../../utils/ErrorCodes';

export class CancelRaffle extends Command{

    constructor(){
        super(
            'cancel',
            ['çekilişiptalet', 'çekilişiiptalet', 'cekilisiptal', 'çekilişiptal', 'cancelraffle'],
            'Var olan bir çekilişi bitirir.',
            '[çekiliş mesaj id]',
            'ADMINISTRATOR'
        );
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        const message_id = args[0];

        if(!message_id || typeof message_id !== 'string') return false;

        const CANCEL_RAFFLE = `
            mutation(
                $message_id: String!
            ){
                cancelRaffle(data: {
                    message_id: $message_id
                }){
                    errorCode
                    raffle{
                        message_id
                        channel_id
                        server_id
                    }
                }
            }
        `;

        const result = await call({
            source: CANCEL_RAFFLE,
            variableValues: {
                message_id: message_id
            }
        })

        const cancelRaffle = result.data.cancelRaffle;
        if(cancelRaffle.errorCode === ErrorCodes.NOT_FOUND){
            const embed = new MessageEmbed()
                .setColor('RED')
                .setAuthor(client.user.username)
                .setDescription('Çekiliş bulunamadı.')

            await message.channel.send({ embed })

            return true
        }

        if(cancelRaffle.errorCode === ErrorCodes.RAFFLE_FINISHED_ERROR){
            const embed = new MessageEmbed()
                .setColor('RED')
                .setAuthor(client.user.username)
                .setDescription('Bu çekiliş devam eden bir çekiliş değil. Bu komut sadece devam eden çekilişlerde kullanılabilir.')

            await message.channel.send({ embed })

            return true
        }

        const raffle = cancelRaffle.raffle
        const $message = await client.helpers.message.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
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