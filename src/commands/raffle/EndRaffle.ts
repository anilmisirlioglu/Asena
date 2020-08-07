import { Message } from 'discord.js'

import Command from '../Command'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';

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

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        let message_id: string | undefined = args[0]

        const raffle = await (message_id ? server.raffles.get(message_id) : server.raffles.getLastCreated())
        if(!raffle || !raffle.message_id){
            await message.channel.send({
                embed: this.getErrorEmbed(`Erken bitirilebilecek bir çekiliş bulunamadı.`)
            })
            return true
        }

        if(!raffle.isContinues()){
            await message.channel.send({
                embed: this.getErrorEmbed('Anlaşılan bu çekiliş zaten bitmiş veya iptal edilmiş.')
            })
            return true
        }

        await raffle.finish(client)
        await message.channel.send(`**${raffle.prize}** çekilişi erken bitirildi. Sonuçlar <#${raffle.channel_id}> kanalına gönderildi.`)
        await message.delete({
            timeout: 100
        })

        return true
    }
}
