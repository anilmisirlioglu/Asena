import Command, { Group, Result } from '../Command';
import { ChatInputCommandInteraction, EmbedBuilder, version } from 'discord.js';
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
            group: Group.Bot,
            description: 'commands.bot.info.description',
            permission: undefined,
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, action: ChatInputCommandInteraction): Promise<Result>{
        const memArr = await client.shard.broadcastEval(() => process.memoryUsage())
        const totalMemUsage = memArr.reduce((prev, curr) => prev + curr.heapUsed, 0)
        const embed = new EmbedBuilder()
            .setAuthor({ name: `🤖 ${server.translate('commands.bot.info.embed.title')}` })
            .setFooter({ text: server.translate('commands.bot.info.embed.footer') })
            .setTimestamp()
            .setColor('#CD5C5C')
            .setFields([
                {
                    name: server.translate('commands.bot.info.embed.advanced.fields.uptime'),
                    value: '```' + secondsToString(Math.floor(client.uptime / 1000), server.locale).toString() + '```'
                },
                {
                    name: server.translate('commands.bot.info.embed.advanced.fields.platform'),
                    value: '```' + `${os.platform()} (${os.type()} ${os.arch()}) - ${os.release()}` + '```'
                },
                {
                    name: server.translate('commands.bot.info.embed.advanced.fields.version.name'),
                    value: server.translate('commands.bot.info.embed.advanced.fields.version.value',
                        process.versions.node,
                        version,
                        client.version.getFullVersion(),
                        client.version.getLastUpdate().slice(0, 7)
                    )
                },
                {
                    name: server.translate('commands.bot.info.embed.advanced.fields.memory.name'),
                    value: server.translate('commands.bot.info.embed.advanced.fields.memory.value',
                        Byte.getSymbolByQuantity(os.totalmem()),
                        Byte.getSymbolByQuantity(os.totalmem() - os.freemem()),
                        Byte.getSymbolByQuantity(os.freemem()),
                        Byte.getSymbolByQuantity(process.memoryUsage().heapUsed),
                        Byte.getSymbolByQuantity(totalMemUsage)
                    )
                },
                {
                    name: server.translate('commands.bot.info.embed.advanced.fields.processor.name'),
                    value: server.translate('commands.bot.info.embed.advanced.fields.processor.value',
                        os.cpus()[0].model,
                        os.cpus()[0].speed,
                        os.cpus().length / 2,
                        os.cpus().length,
                        secondsToString(os.uptime(), server.locale).toString()
                    )
                }
                ,{
                    name: server.translate('commands.bot.info.embed.advanced.fields.database.name'),
                    value: server.translate('commands.bot.info.embed.advanced.fields.database.value',
                        `MongoDB (x${MongoDB.serverInfo['bits']}) v${MongoDB.serverInfo['version']}`,
                        server.translate(MongoDB.getState())
                    )
                }
            ])

        await action.reply({ embeds: [embed] })
        return null
    }

}
