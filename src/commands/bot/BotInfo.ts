import { Command } from '../Command';
import { Message, MessageEmbed, version } from 'discord.js';
import { SuperClient } from '../../Asena';
import { DateTimeHelper } from '../../helpers/DateTimeHelper';
import * as os from 'os';
import Byte from '../../utils/Byte';
import MongoDB from '../../drivers/MongoDB';

export default class BotInfo extends Command{

    constructor(){
        super({
            name: 'botinfo',
            aliases: [],
            description: 'Bot hakkında teknik bilgi verir.',
            usage: null,
            permission: undefined
        });
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor('🤖 Bot Bilgisi', '')
            .setFooter('Syntax Software tarafından ❤️ ile yapılmıştır')
            .setTimestamp()
            .setColor('#CD5C5C')

        const uptime = DateTimeHelper.secondsToTime(Math.floor(client.uptime / 1000))

        const textArr: string[] = [
            `Çalışabilirlik Süresi (Uptime): **${uptime.toString()}**`,
            `NodeJS Version: **${process.versions.node}**`,
            `DiscordJS Version: **${version}**`,
            `Artemis Version: **${client.version.getFullVersion()}**`,
            `Artemis Last Update: **${client.version.getLastUpdate().substr(0, 7)}**`,
            `Platform (OS): **${os.platform()} (${os.type()} ${os.arch()}) - ${os.release()}**`,
            `Veritabanı Bağlantısı: ${MongoDB.isConnected() ? '**Bağlı, stabil.**' : '**Bağlı değil.**'}`,
            `CPU: **${os.cpus().shift().model}**`,
            `CPU Hız: **${os.cpus().shift().speed} MHz**`,
            `CPU Core: **${os.cpus().length / 2} Core / ${os.cpus().length} Thread**`,
            `Toplam Bellek: **${Byte.getSymbolByQuantity(os.totalmem())}**`,
            `Kullanılan Bellek: **${Byte.getSymbolByQuantity(os.totalmem() - os.freemem())}**`,
            `Kullanılabilir Bellek: **${Byte.getSymbolByQuantity(os.freemem())}**`,
            `Asena Tarafından Kullanılan Bellek: **${Byte.getSymbolByQuantity(process.memoryUsage().heapTotal)}**`
        ]

        embed.addField('**Asena**', textArr.join('\n'))

        await message.channel.send({
            embed
        })

        return true
    }

}