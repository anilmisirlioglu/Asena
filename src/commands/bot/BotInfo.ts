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
            description: 'commands.bot.info.description',
            usage: null,
            permission: undefined
        });
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const argsOfTranslate = [
            secondsToTime(Math.floor(client.uptime / 1000), server.locale).toString(),
            process.versions.node,
            version,
            client.version.getFullVersion(),
            client.version.getLastUpdate().substr(0, 7),
            `${os.platform()} (${os.type()} ${os.arch()}) - ${os.release()}`,
            MongoDB.isConnected() ? `**${server.translate('global.connected')}**` : `**${server.translate('global.disconnected')}**`,
            os.cpus().shift().model,
            os.cpus().shift().speed,
            os.cpus().length / 2,
            os.cpus().length,
            secondsToTime(os.uptime(), server.locale).toString(),
            Byte.getSymbolByQuantity(os.totalmem()),
            Byte.getSymbolByQuantity(os.totalmem() - os.freemem()),
            Byte.getSymbolByQuantity(os.freemem()),
            Byte.getSymbolByQuantity(process.memoryUsage().heapTotal)
        ]

        const translate = server.translate('commands.bot.info.embed.content', ...argsOfTranslate)
        const embed: MessageEmbed = new MessageEmbed()
            .setAuthor(`🤖 ${server.translate('commands.bot.info.embed.title')}`, '')
            .setFooter(server.translate('commands.bot.info.embed.footer'))
            .setTimestamp()
            .setColor('#CD5C5C')
            .addField(`**${client.user.username}**`, translate)

        await message.channel.send({ embed })
        return true
    }

}
