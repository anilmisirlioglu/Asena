import { Collection, CommandInteraction, GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import Command from './Command';
import { Bot} from '../Constants';
import Factory from '../Factory';
import { ICommandPremium } from '../decorators/Premium';
import PermissionController from './PermissionController';
import CommandPool from './CommandPool';
import CommandPacket from '../protocol/CommandPacket';

type CommandMap = Collection<string, Command>

interface CommandRunner{
    run(action: CommandInteraction): void
}

export default class CommandHandler extends Factory implements CommandRunner{

    private permissionController: PermissionController = new PermissionController()

    private commands: CommandMap = new Collection<string, Command>()

    public registerAllCommands(): void{
        for(const command of new CommandPool()){
            this.registerCommand(command)
        }

        this.client.logger.info(`Total ${this.commands.size} command successfully loaded.`)
    }

    public registerCommand(command: Command){
        this.commands.set(command.name, command)
    }

    protected getPermissionController(): PermissionController{
        return this.permissionController
    }

    async run(action: CommandInteraction){
        if(!action.guild || action.user.bot){
            return
        }

        const channel = action.channel
        if(!(channel instanceof TextChannel)){
            return
        }

        let server = await this.client.servers.get(action.guild.id)
        if(!server){
            server = await this.client.servers.create({ server_id: action.guild?.id })
        }

        if(!(action.member instanceof GuildMember)){
            return
        }

        const channel_id: string = this.client.getSetupManager().getSetupChannel(action.user.id)
        if(channel_id && channel_id === action.channel.id){ // check setup
            return
        }

        let command = this.commands.get(action.commandName) as Command & ICommandPremium
        if(command){
            const authorized: boolean = command.hasPermission(action.member) || action.member.roles.cache.filter(role => {
                return role.name.trim().toLowerCase() === Bot.PERMITTED_ROLE_NAME
            }).size !== 0 || server.isPublicCommand(command.name)
            if(authorized && action.channel instanceof TextChannel){
                const checkPermissions = this.getPermissionController().checkSelfPermissions(action.guild, action.channel)
                if(checkPermissions.has){
                    if(!command.premium || (command.premium && server.isPremium())){
                        command.run(this.client, server, action).then(async result => {
                            if(result && result.error){
                                await action.reply({
                                    embeds: [command.getErrorEmbed(server.translate(result.error, ...result.args))]
                                })
                            }else{
                                this.pushMetric(command.name)
                            }
                        })
                    }else{
                        const embed = new MessageEmbed()
                            .setAuthor(this.client.user.username, this.client.user.avatarURL())
                            .setDescription(server.translate('commands.handler.premium.only'))
                            .addField(`:star2:  ${server.translate('commands.handler.premium.try')}`, '<:join_arrow:746358699706024047> [Asena Premium](https://asena.xyz)')
                            .setColor('GREEN')

                        await action.reply({ embeds: [embed] })
                    }
                }else{
                    if(checkPermissions.missing.includes('SEND_MESSAGES') || checkPermissions.missing.includes('VIEW_CHANNEL')){
                        try{
                            action.user.createDM().then(dm => {
                                dm.send(server.translate('commands.handler.permission.missing.message', channel.name))
                            })
                        }catch(e){}
                    }else{
                        let i = 1
                        const missingToString = checkPermissions
                            .missing
                            .map(permission => `**${i++}.** ${server.translate(`global.permissions.${PermissionController.humanizePermission(permission)}`)}`)
                            .join('\n')

                        await action.reply(server.translate('commands.handler.permission.missing.others', missingToString))
                    }
                }
            }else{
                await action.reply({
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
