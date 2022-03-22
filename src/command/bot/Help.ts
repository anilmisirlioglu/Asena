import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js'
import Command, { Group } from '../Command'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { Bot, prefix } from '../../Constants';

export default class Help extends Command{

    constructor(){
        super({
            name: 'help',
            group: Group.BOT,
            description: 'commands.bot.help.description',
            permission: undefined,
            examples: [
                'command: help',
                'command: create'
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<boolean>{
        const command = action.options.getString('command', false)
        if(!command){
            const commands = client.getCommandHandler().getCommandsArray().filter(command => {
                if(command.permission === 'ADMINISTRATOR'){
                    if(action.member instanceof GuildMember){
                        return (
                            action.member.permissions.has('ADMINISTRATOR') ||
                            action.member.roles.cache.find(role => role.name.trim().toLowerCase() === Bot.PERMITTED_ROLE_NAME)
                        )
                    }
                }

                return true
            })

            const fieldMap = {}
            for(const command of commands){
                const label = `\`${command.name}\`: ${server.translate(command.description)}`
                if(!fieldMap[command.group]){
                    fieldMap[command.group] = {
                        name: server.translate(`commands.${command.group}.name`),
                        value: ''
                    }
                }

                fieldMap[command.group].value += `${label}\n`
            }

            const embed = new MessageEmbed()
                .setAuthor(`📍 ${server.translate('commands.bot.help.embed.title')}`, action.user.displayAvatarURL() || action.user.defaultAvatarURL)
                .addFields(Object.values(fieldMap))
                .addField(`🌟 ${server.translate('commands.bot.help.embed.fields.more.detailed')}`, `${prefix}${this.name} [${server.translate('commands.bot.help.embed.fields.command')}]`)
                .addField(`❓ ${server.translate('commands.bot.help.embed.fields.more.info')}`, `**[Wiki](https://wiki.asena.xyz)** - **[${server.translate('global.support')}](https://dc.asena.xyz)** - **[Website](https://asena.xyz)**`)
                .addField(`⭐ ${server.translate('commands.bot.help.embed.fields.star')}`, '**[GitHub](https://github.com/anilmisirlioglu/Asena)**')
                .setColor('RANDOM')

            action.user.createDM().then(channel => {
                channel.send({ embeds: [embed] }).then(() => {
                    action.reply({
                        content: server.translate('commands.bot.help.success'),
                        ephemeral: true
                    })
                }).catch(() => action.reply({ embeds: [embed] }))
            })

            return true
        }else{
            let embed
            const cmd = client.getCommandHandler().getCommandsMap().filter($command => $command.name === command.trim()).first()
            if(cmd){
                const fullCMD = prefix + cmd.name
                embed = new MessageEmbed()
                    .setAuthor(`📍 ${server.translate('commands.bot.help.embed.title')}`, action.user.displayAvatarURL() || action.user.defaultAvatarURL)
                    .addField(server.translate('commands.bot.help.embed.fields.command'), fullCMD)
                    .addField(server.translate('commands.bot.help.embed.fields.description'), server.translate(cmd.description))
                    .addField(server.translate('commands.bot.help.embed.fields.permission'), cmd.permission === 'ADMINISTRATOR' ? server.translate('global.admin') : server.translate('global.member'))
                    .setColor('GREEN')

                if(cmd.examples.length > 0){
                    const items = cmd.examples.map(item => `${fullCMD} ${this.parseOption(item)}`)

                    embed.addField(server.translate('global.example'), items.join('\n'))
                }
            }

            await action.reply({
                embeds: [embed ?? this.getErrorEmbed(server.translate('commands.bot.help.error', command))]
            })
            return true
        }
    }

    private parseOption(str: string): string{
        const options = (str.match(/[\w-]{1,32}:(.+?)(?=[^\s]+:|$)/gm) ?? []).map(item => {
            const kv = item.split(' ')
            const key = kv.shift()
            if(key.startsWith('sub:')){
                return `${key.split(':').pop()} ${kv.join(' ')}`
            }

            return `**${key}** ${kv.join(' ')}`
        })

        return options.join(' ')
    }

}
