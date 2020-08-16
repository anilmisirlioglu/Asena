import Command from '../Command';
import { Message, MessageEmbed, version } from 'discord.js';
import SuperClient from '../../SuperClient';
import { secondsToTime } from '../../utils/DateTimeHelper';
import * as os from 'os';
import Byte from '../../utils/Byte';
import MongoDB from '../../drivers/MongoDB';
import Server from '../../structures/Server';

export default class BotInfo extends Command{

    constructor(){
        super({
            name: 'botinfo',
            aliases: ['teknikbilgi'],
            description: 'Bot hakkında teknik bilgi verir.',
            usage: null,
            permission: undefined
        });
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor('🤖 Bot Bilgisi', '')
            .setFooter('Syntax Software tarafından ❤️ ile yapılmıştır')
            .setTimestamp()
            .setColor('#CD5C5C')

        const textArr: string[] = [
            `Çalışma Süresi (Uptime): **${secondsToTime(Math.floor(client.uptime / 1000))}**`,
            `NodeJS Sürümü: **${process.versions.node}**`,
            `DiscordJS Sürümü: **${version}**`,
            `Asena Sürümü: **${client.version.getFullVersion()}**`,
            `Asena Son Güncelleme: **${client.version.getLastUpdate().substr(0, 7)}**`,
            `Platform (OS): **${os.platform()} (${os.type()} ${os.arch()}) - ${os.release()}**`,
            `Veritabanı Bağlantısı: ${MongoDB.isConnected() ? '**Bağlı, stabil.**' : '**Bağlı değil.**'}`,
            `CPU: **${os.cpus().shift().model}**`,
            `CPU Hız: **${os.cpus().shift().speed} MHz**`,
            `CPU Çekirdek (Core): **${os.cpus().length / 2} Core / ${os.cpus().length} Thread**`,
            `CPU Çalışma Süresi (Uptime): **${secondsToTime(os.uptime())}**`,
            `Toplam Bellek: **${Byte.getSymbolByQuantity(os.totalmem())}**`,
            `Kullanılan Bellek: **${Byte.getSymbolByQuantity(os.totalmem() - os.freemem())}**`,
            `Kullanılabilir Bellek: **${Byte.getSymbolByQuantity(os.freemem())}**`,
            `Asena Tarafından Kullanılan Bellek: **${Byte.getSymbolByQuantity(process.memoryUsage().heapTotal)}**`
        ]

        embed.addField('**Asena**', textArr.join('\n'))

        await message.channel.send({ embed })
        return true
    }

}
