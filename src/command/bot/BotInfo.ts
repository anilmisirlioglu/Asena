import Command, { Group } from '../Command';
import { Message, MessageEmbed, version } from 'discord.js';
import SuperClient from '../../SuperClient';
import { secondsToString } from '../../utils/DateTimeHelper';
import * as os from 'os';
import Byte from '../../utils/Byte';
import MongoDB from '../../MongoDB';
import Server from '../../structures/Server';

export default class BotInfo extends Command{

    constructor(){
        super({
            name: 'botinfo',
            group: Group.BOT,
            aliases: ['teknikbilgi'],
            description: 'commands.bot.info.description',
            usage: null,
            permission: undefined,
            examples: [
                '',
                'basic'
            ]
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const embed = new MessageEmbed()
            .setAuthor(`🤖 ${server.translate('commands.bot.info.embed.title')}`, '')
            .setFooter(server.translate('commands.bot.info.embed.footer'))
            .setTimestamp()
            .setColor('#CD5C5C')

        const memArr = await client.shard.broadcastEval('process.memoryUsage()')
        const totalMemUsage = memArr.reduce((prev, curr) => prev.heapUsed + curr.heapUsed, { heapUsed: 0 })
        const isBasicView = args[0] && args[0] === 'basic'
        if(isBasicView){
            embed.addField(`**${client.user.username}**`, server.translate('commands.bot.info.embed.basic.content',
                secondsToString(Math.floor(client.uptime / 1000), server.locale).toString(),
                process.versions.node,
                version,
                client.version.getFullVersion(),
                client.version.getLastUpdate().substr(0, 7),
                `${os.platform()} (${os.type()} ${os.arch()}) - ${os.release()}`,
                server.translate(MongoDB.getState()),
                `MongoDB x(${MongoDB.serverInfo['bits']}) v${MongoDB.serverInfo['version']}`,
                os.cpus()[0].model,
                os.cpus()[0].speed,
                os.cpus().length / 2,
                os.cpus().length,
                secondsToString(os.uptime(), server.locale).toString(),
                Byte.getSymbolByQuantity(os.totalmem()),
                Byte.getSymbolByQuantity(os.totalmem() - os.freemem()),
                Byte.getSymbolByQuantity(os.freemem()),
                Byte.getSymbolByQuantity(process.memoryUsage().heapUsed),
                Byte.getSymbolByQuantity(totalMemUsage)
            ))
        }else{
            embed
                .addField(server.translate('commands.bot.info.embed.advanced.fields.uptime'), '```' + secondsToString(Math.floor(client.uptime / 1000), server.locale).toString() + '```')
                .addField(server.translate('commands.bot.info.embed.advanced.fields.platform'), '```' + `${os.platform()} (${os.type()} ${os.arch()}) - ${os.release()}` + '```')
                .addField(
                    server.translate('commands.bot.info.embed.advanced.fields.version.name'),
                    server.translate('commands.bot.info.embed.advanced.fields.version.value',
                        process.versions.node,
                        version,
                        client.version.getFullVersion(),
                        client.version.getLastUpdate().substr(0, 7)
                    )
                )
                .addField(
                    server.translate('commands.bot.info.embed.advanced.fields.memory.name'),
                    server.translate('commands.bot.info.embed.advanced.fields.memory.value',
                        Byte.getSymbolByQuantity(os.totalmem()),
                        Byte.getSymbolByQuantity(os.totalmem() - os.freemem()),
                        Byte.getSymbolByQuantity(os.freemem()),
                        Byte.getSymbolByQuantity(process.memoryUsage().heapUsed),
                        Byte.getSymbolByQuantity(totalMemUsage)
                    )
                )
                .addField(
                    server.translate('commands.bot.info.embed.advanced.fields.processor.name'),
                    server.translate('commands.bot.info.embed.advanced.fields.processor.value',
                        os.cpus()[0].model,
                        os.cpus()[0].speed,
                        os.cpus().length / 2,
                        os.cpus().length,
                        secondsToString(os.uptime(), server.locale).toString()
                    )
                )
                .addField(
                    server.translate('commands.bot.info.embed.advanced.fields.database.name'),
                    server.translate('commands.bot.info.embed.advanced.fields.database.value',
                        `MongoDB (x${MongoDB.serverInfo['bits']}) v${MongoDB.serverInfo['version']}`,
                        server.translate(MongoDB.getState())
                    )
                )
        }

        await message.channel.send({ embed })
        return true
    }

}
