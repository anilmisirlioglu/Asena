import { Collection, Message, MessageEmbed, TextChannel } from 'discord.js';
import Command from './Command';
import SuperClient from '../SuperClient';
import { Bot } from '../Constants';
import Factory from '../Factory';
import { ICommandPremium } from '../decorators/Premium';
import PermissionController from './PermissionController';
import CommandPool from './CommandPool';
import CommandPacket from '../protocol/CommandPacket';

type CommandMap = Collection<string, Command>

interface CommandRunner{
    run(message: Message): void
}

export default class CommandHandler extends Factory implements CommandRunner{

    private permissionController: PermissionController = new PermissionController()

    private commands: CommandMap = new Collection<string, Command>()
    private aliases: Collection<string, string> = new Collection<string, string>()

    public registerAllCommands(): void{
        for(const command of new CommandPool()){
            this.registerCommand(command)
        }

        this.client.logger.info(`Total ${this.commands.size} command successfully loaded.`)
    }

    public registerCommand(command: Command){
        this.commands.set(command.name, command)

        if(command.aliases && Array.isArray(command.aliases)){
            command.aliases.forEach(alias => {
                this.aliases.set(alias, command.name)
            })
        }
    }

    protected getPermissionController(): PermissionController{
        return this.permissionController
    }

    async run(message: Message){
        const client: SuperClient = this.client
        if(!message.guild){
            return
        }

        if(message.author.bot){
            return
        }

        const channel = message.channel
        if(!(channel instanceof TextChannel)){
            return
        }

        let server = await client.servers.get(message.guild.id)
        if(!server){
            server = await client.servers.create({
                server_id: message.guild?.id
            } as any)
        }

        if(!message.member){
            return
        }

        const channel_id: string = this.client.getSetupManager().getSetupChannel(message.member.id)
        if(channel_id && channel_id === message.channel.id){ // check setup
            return
        }

        const prefix = (client.isDevBuild ? 'dev' : '') + (server.prefix || client.prefix)
        if(!message.content.startsWith(prefix)){
            if(channel.permissionsFor(client.user).has('SEND_MESSAGES')){
                if(message.content === Bot.PREFIX_COMMAND){
                    await channel.send(`🌈   ${server.translate('commands.handler.prefix', server.prefix)}`)

                    return
                }

                if(message.mentions.has(client.user) && !message.mentions.everyone){
                    await message.channel.send('🌈  ' + server.translate('commands.handler.mention', client.user.username, server.prefix))

                    return
                }
            }

            return
        }

        const args: string[] = message.content.slice(prefix.length).trim().split(/ +/g)
        const cmd = args.shift().toLowerCase()
        if(cmd.length === 0){
            return
        }

        let command: Command & ICommandPremium | undefined = this.commands.get(cmd) as Command & ICommandPremium;
        if(!command){ // control is alias command
            command = this.commands.get(this.aliases.get(cmd)) as Command & ICommandPremium;
        }

        if(command){
            const authorized: boolean = command.hasPermission(message.member) || message.member.roles.cache.filter(role => {
                return role.name.trim().toLowerCase() === Bot.PERMITTED_ROLE_NAME
            }).size !== 0 || server.isPublicCommand(command.name)
            if(authorized && message.channel instanceof TextChannel){
                const checkPermissions = this.getPermissionController().checkSelfPermissions(
                    message.guild,
                    message.channel
                )
                if(checkPermissions.has){
                    if(!command.premium || (command.premium && server.isPremium())){
                        command.run(client, server, message, args).then(async (result: boolean) => {
                            if(!result){
                                const fullCMD = server.prefix + command.name
                                const embed = new MessageEmbed()
                                    .setTitle(`${server.translate('commands.bot.help.embed.fields.command')}: ${fullCMD}`)
                                    .setDescription([
                                        `**${server.translate('commands.bot.help.embed.fields.description')}:** ${server.translate(command.description)}`,
                                        `**${server.translate('global.usage')}: **${fullCMD} ${server.translate(command.usage)}`,
                                        `**${server.translate('global.example')}:** ${(command.examples.length === 1 ? fullCMD + ' ' + command.examples : '\n' + command.examples.map(item => fullCMD + ' ' + item).join('\n'))}`
                                    ].join('\n'))
                                    .setColor('BLUE')

                                await channel.send({ embeds: [embed] })
                            }else{
                                this.pushMetric(command.name)
                            }
                        })
                    }else{
                        const embed = new MessageEmbed()
                            .setAuthor(client.user.username, client.user.avatarURL())
                            .setDescription(server.translate('commands.handler.premium.only'))
                            .addField(`:star2:  ${server.translate('commands.handler.premium.try')}`, '<:join_arrow:746358699706024047> [Asena Premium](https://asena.xyz)')
                            .setColor('GREEN')

                        await channel.send({ embeds: [embed] })
                    }
                }else{
                    if(checkPermissions.missing.includes('SEND_MESSAGES') || checkPermissions.missing.includes('VIEW_CHANNEL')){
                        try{
                            message.author.createDM().then(dmChannel => {
                                dmChannel.send(server.translate('commands.handler.permission.missing.message', channel.name))
                            })
                        }catch(e){}
                    }else{
                        let i = 1
                        const missingToString = checkPermissions
                            .missing
                            .map(permission => `**${i++}.** ${server.translate(`global.permissions.${PermissionController.humanizePermission(permission)}`)}`)
                            .join('\n')

                        await channel.send(server.translate('commands.handler.permission.missing.others', missingToString))
                    }
                }
            }else{
                await channel.send({
                    embeds: [command.getErrorEmbed(server.translate('commands.handler.unauthorized'))]
                })
            }
        }
    }

    public getCommandsArray(): Command[]{
        return Array.from(this.commands.values())
    }

    public getCommandsMap(): CommandMap{
        return this.commands
    }

    private pushMetric(command: string): void{
        this.client.shard.send(new CommandPacket(command)).then(void 0)
    }

}
