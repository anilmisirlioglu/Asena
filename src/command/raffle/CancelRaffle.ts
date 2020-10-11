import { Message } from 'discord.js'

import Command from '../Command'
import { Emojis } from '../../Constants'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

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

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        let message_id: string | undefined = args[0]

        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            await message.channel.send({
                embed: this.getErrorEmbed(`İptal edilebilecek bir çekiliş bulunamadı.`)
            })
            return true
        }

        if(!raffle.isCancelable()){
            await message.channel.send({
                embed: this.getErrorEmbed('Bu çekiliş devam eden bir çekiliş değil. Bu komut sadece devam eden çekilişlerde kullanılabilir.')
            })
            return true
        }

        await raffle.setCanceled()

        const $message = await client.fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
        if($message){
            await $message.delete({
                timeout: 0
            })
        }

        await message.channel.send(`${Emojis.CONFETTI_EMOJI} Çekiliş başarıyla iptal edildi.`)

        if(message.guild.me.hasPermission('MANAGE_MESSAGES')){
            await message.delete({
                timeout: 0
            })
        }

        return true;
    }

}
