import { ChatInputCommandInteraction, Colors, EmbedBuilder, GuildMember, PermissionsBitField } from 'discord.js'
import Command, { Group, Result } from '../Command'
import SuperClient from '../../SuperClient';
import Server from '../../structures/Server';
import { Bot, prefix } from '../../Constants';

export default class Help extends Command{

    constructor(){
        super({
            name: 'help',
            group: Group.Bot,
            description: 'commands.bot.help.description',
            permission: undefined,
            examples: [
                'command: help',
                'command: create'
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: ChatInputCommandInteraction): Promise<Result>{
        const command = action.options.getString('command', false)
        if(!command){
            const commands = client.getCommandHandler().getCommandsArray().filter(command => {
                if(command.permission === PermissionsBitField.Flags.Administrator){
                    if(action.member instanceof GuildMember){
                        return (
                            action.member.permissions.has(PermissionsBitField.Flags.Administrator) ||
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

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `📍 ${server.translate('commands.bot.help.embed.title')}`,
                    iconURL: action.user.displayAvatarURL() || action.user.defaultAvatarURL,
                })
                .addFields(Object.values(fieldMap))
                .addFields([
                    {
                        name: `🌟 ${server.translate('commands.bot.help.embed.fields.more.detailed')}`,
                        value: `${prefix}${this.name} [${server.translate('commands.bot.help.embed.fields.command')}]`
                    },
                    {
                        name: `❓ ${server.translate('commands.bot.help.embed.fields.more.info')}`,
                        value: `**[Wiki](https://wiki.asena.xyz)** - **[${server.translate('global.support')}](https://dc.asena.xyz)** - **[Website](https://asena.xyz)**`
                    },
                    {
                        name: `⭐ ${server.translate('commands.bot.help.embed.fields.star')}`,
                        value: '**[GitHub](https://github.com/anilmisirlioglu/Asena)**'
                    }
                ])
                .setColor('Random')

            action.user.createDM().then(channel => {
                channel.send({ embeds: [embed] }).then(() => {
                    action.reply({
                        content: server.translate('commands.bot.help.success'),
                        ephemeral: true
                    })
                }).catch(() => action.reply({ embeds: [embed] }))
            })
        }else{
            let embed
            const cmd = client.getCommandHandler().getCommandsMap().filter($command => $command.name === command.trim()).first()
            if(cmd){
                const fullCMD = prefix + cmd.name
                embed = new EmbedBuilder()
                    .setAuthor({
                        name: `📍 ${server.translate('commands.bot.help.embed.title')}`,
                        iconURL: action.user.displayAvatarURL() || action.user.defaultAvatarURL
                    })
                    .setFields([
                        {
                            name: server.translate('commands.bot.help.embed.fields.command'),
                            value: fullCMD
                        },
                        {
                            name: server.translate('commands.bot.help.embed.fields.description'),
                            value: server.translate(cmd.description)
                        },
                        {
                            name: server.translate('commands.bot.help.embed.fields.permission'),
                            value: server.translate(cmd.permission === PermissionsBitField.Flags.Administrator ? 'global.admin' : 'global.member')
                        }
                    ])
                    .setColor(Colors.Green)

                if(cmd.examples.length > 0){
                    const items = cmd.examples.map(item => `${fullCMD} ${this.parseOption(item)}`)

                    embed.addField(server.translate('global.example'), items.join('\n'))
                }
            }

            await action.reply({
                embeds: [embed ?? this.getErrorEmbed(server.translate('commands.bot.help.error', command))]
            })
        }

        return null
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
