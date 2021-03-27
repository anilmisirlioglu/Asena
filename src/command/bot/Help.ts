import { Message, MessageEmbed } from 'discord.js'

import Command from '../Command'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { Bot } from '../../Constants';

export default class Help extends Command{

    constructor(){
        super({
            name: 'help',
            aliases: ['yardim', 'yardım'],
            description: 'commands.bot.help.description',
            usage: null,
            permission: undefined,
            examples: []
        })
    }

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        const command: undefined | string = args[0]
        const prefix = (await client.servers.get(message.guild.id)).prefix
        if(!args[0]){
            const text = client.getCommandHandler().getCommandsArray().map(command => {
                const label = `\`${command.name}\`: ${server.translate(command.description)}`
                return command.permission === 'ADMINISTRATOR' ? (
                    (
                        message.member.hasPermission('ADMINISTRATOR') ||
                        message.member.roles.cache.find(role => role.name.trim().toLowerCase() == Bot.PERMITTED_ROLE_NAME)
                    ) ? label : undefined
                ) : label
            }).filter(Boolean).join('\n')

            const embed = new MessageEmbed()
                .setAuthor(`📍 ${server.translate('commands.bot.help.embed.title')}`, message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                .addField(server.translate('commands.bot.help.embed.fields.commands'), text)
                .addField(`🌟 ${server.translate('commands.bot.help.embed.fields.more.detailed')}`, `${prefix}${this.name} [${server.translate('commands.bot.help.embed.fields.command')}]`)
                .addField(`❓ ${server.translate('commands.bot.help.embed.fields.more.info')}`, `**[Wiki](https://wiki.asena.xyz)** - **[${server.translate('global.support')}](https://dc.asena.xyz)** - **[Website](https://asena.xyz)**`)
                .addField(`⭐ ${server.translate('commands.bot.help.embed.fields.star')}`, '**[GitHub](https://github.com/anilmisirlioglu/Asena)**')
                .setColor('RANDOM')

            message.author.createDM().then(channel => {
                channel.send({ embed }).then(() => {
                    message.channel.send(server.translate('commands.bot.help.success', `<@${message.author.id}>`)).then($message => {
                        $message.delete({ timeout: 2000 }).then(() => {
                            message.delete();
                        })
                    })
                }).catch(() => message.channel.send({ embed }))
            })

            return true
        }else{
            const searchCommand: Command | undefined = client.getCommandHandler().getCommandsMap().filter($command => $command.name === command.trim()).first()
            let embed
            if(searchCommand){
                const fullCMD = prefix + searchCommand.name
                const embed = new MessageEmbed()
                    .setAuthor(`📍 ${server.translate('commands.bot.help.embed.title')}`, message.author.displayAvatarURL() || message.author.defaultAvatarURL)
                    .addField(server.translate('commands.bot.help.embed.fields.command'), fullCMD)
                    .addField(server.translate('commands.bot.help.embed.fields.alias'), searchCommand.aliases.map(alias => `${prefix}${alias}`).join('\n'))
                    .addField(server.translate('commands.bot.help.embed.fields.description'), server.translate(searchCommand.description))
                    .addField(server.translate('commands.bot.help.embed.fields.permission'), searchCommand.permission === 'ADMINISTRATOR' ? server.translate('global.admin') : server.translate('global.member'))
                    .addField(server.translate('commands.bot.help.embed.fields.usage'), `${fullCMD} ${searchCommand.usage === null ? '' : server.translate(searchCommand.usage)}`)
                    .setColor('GREEN')

                if(searchCommand.examples.length > 0){
                    embed.addField(server.translate('global.example'), searchCommand.examples.length === 1 ? fullCMD + ' ' + searchCommand.examples : '\n' + searchCommand.examples.map(item => fullCMD + ' ' + item).join('\n'))
                }

                await message.channel.send({ embed })

                return true
            }

            await message.channel.send({ embed: embed ?? this.getErrorEmbed(server.translate('commands.bot.help.error', command)) })
            return true
        }
    }
}
