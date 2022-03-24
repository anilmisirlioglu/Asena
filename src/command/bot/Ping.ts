import Command, { Group, Result } from '../Command';
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { CommandInteraction, MessageEmbed } from 'discord.js';

export default class Ping extends Command{

    constructor(){
        super({
            name: 'ping',
            group: Group.BOT,
            description: 'commands.bot.ping.description',
            permission: undefined,
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<Result>{
        action.channel.send(`<a:green_loading:736926844254814239> ${server.translate('commands.bot.ping.calculating')}`).then(async m => {
            const embed = new MessageEmbed()
                .setAuthor(`${server.translate('commands.bot.ping.title')} 🚀`)
                .setDescription([
                    `🤖 ${server.translate('commands.bot.ping.latency.bot')}: \`${this.resolveMS(m.createdTimestamp - action.createdTimestamp)}\``,
                    `📨 ${server.translate('commands.bot.ping.latency.api')}: \`${this.resolveMS(client.ws.ping)}\``
                ].join('\n'))
                .setColor('BLUE')

            await Promise.all([
                m.delete(),
                action.reply({ embeds: [embed] })
            ])
        })

        return null
    }

    private resolveMS = (ms: number): string => ms > 999 ? `${ms / 1000}s` : `${ms}ms`

}
