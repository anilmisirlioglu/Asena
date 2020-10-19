import Command from '../Command';
import SuperClient from '../../SuperClient';
import { Message, MessageEmbed } from 'discord.js';
import Server from '../../structures/Server';
import { Bot } from '../../Constants'

export default class Invitation extends Command{

    constructor(){
        super({
            name: 'davet',
            aliases: ['invite', 'party', 'davetiye', 'link'],
            description: 'Botun davet linkini verir.',
            usage: null,
            permission: undefined
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const embed = new MessageEmbed()
            .setAuthor(SuperClient.NAME, SuperClient.AVATAR)
            .addField(':rainbow:  **Botun Davet Linki:**', `[Tıkla Davet Et](${Bot.INVITE_URL})`)
            .addField('<:hayalet:739432632030593105>  **Destek Sunucusu:**', `[Tıkla ve Giriş Yap](${Bot.SUPPORT_SERVER})`)
            .addField(':earth_americas:  **Websitemiz:**', `[asena.xyz](${Bot.WEBSITE})`)
            .setColor(message.guild.me.displayHexColor)

        await message.channel.send({ embed })
        return true
    }

}
