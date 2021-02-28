import Command from '../Command';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { Message, MessageEmbed } from 'discord.js';

export default class Ping extends Command{

    constructor(){
        super({
            name: 'ping',
            aliases: ['ms'],
            description: 'commands.bot.ping.description',
            usage: null,
            permission: undefined,
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        message.channel.send('<a:green_loading:736926844254814239> Calculating...').then(async m => {
            const embed = new MessageEmbed()
                .setAuthor(`${server.translate('commands.bot.ping.title')} 🚀`)
                .setDescription([
                    `🤖 ${server.translate('commands.bot.ping.latency.bot')}: \`\`${this.resolveMS(m.createdTimestamp - message.createdTimestamp)}\`\``,
                    `📨 ${server.translate('commands.bot.ping.latency.api')}: \`\`${this.resolveMS(client.ws.ping)}\`\``
                ])
                .setColor('BLUE')

            await Promise.all([
                m.delete(),
                message.channel.send({ embed })
            ])
        })

        return true
    }

    private resolveMS = (ms: number): string => ms > 999 ? `${ms / 1000}s` : `${ms}ms`

}
