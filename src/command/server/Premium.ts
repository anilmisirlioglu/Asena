import Command from '../Command';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { Message, MessageEmbed } from 'discord.js';
import { getDateTimeToString } from '../../utils/DateTimeHelper';

export default class Premium extends Command{

    constructor(){
        super({
            name: 'premium',
            aliases: ['pre', 'p'],
            description: 'Premium durumunu görüntüler.',
            usage: null,
            permission: undefined
        });
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        let description: string[]
        if(server.isPremium()){
            description = [
                `Premium: **${server.premium.humanizeType()}**`,
                `Başlangıç Tarihi: **${getDateTimeToString(server.premium.startAt)}**`,
                `Bitiş Tarihi: **${server.premium.type === 'PERMANENT' ? 'Sınırsız ♾️' : getDateTimeToString(server.premium.finishAt)}**`
            ]
        }else{
            description = [
                `Henüz bir **Premium** üyeliğin bulunmuyor.`,
                `:star2:  [Premium 'u Denemeye Ne Dersin?](https://asena.xyz)`
            ]
        }

        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor(`${SuperClient.NAME} Premium`, SuperClient.AVATAR)
            .setColor('LUMINOUS_VIVID_PINK')
            .setFooter(message.guild.name, message.guild.iconURL())
            .setDescription(description)

        await message.channel.send({ embed })
        return true
    }

}
