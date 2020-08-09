import { Collection, Message, TextChannel } from 'discord.js';

import CommandRunner from './CommandRunner';
import Command from './Command';
import { Colors } from '../utils/TextFormat';
import SuperClient from '../SuperClient';
import Constants from '../Constants';
import Factory from '../Factory';

import CancelRaffle from './raffle/CancelRaffle';
import CreateRaffle from './raffle/CreateRaffle';
import ReRollRaffle from './raffle/ReRollRaffle';
import SetupRaffle from './raffle/SetupRaffle';
import EndRaffle from './raffle/EndRaffle';
import Raffles from './raffle/Raffles';
import Vote from './survey/Vote';
import Question from './survey/Question';
import Help from './bot/Help';
import BotInfo from './bot/BotInfo';
import SetPrefix from './server/SetPrefix';
import SetCommandPermission from './server/SetCommandPermission';
import PermissionController from '../controllers/PermissionController';
import Invitation from './bot/Invitation';

type CommandMap = Collection<string, Command>

export default class CommandHandler extends Factory implements CommandRunner{

    private static readonly COMMANDS: Command[] = [
        new CancelRaffle(),
        new CreateRaffle(),
        new ReRollRaffle(),
        new SetupRaffle(),
        new EndRaffle(),
        new Raffles(),
        new Vote(),
        new Question(),
        new Help(),
        new BotInfo(),
        new Invitation(),
        new SetPrefix(),
        new SetCommandPermission()
    ]

    private permissionController: PermissionController = new PermissionController()

    private commands: CommandMap = new Collection<string, Command>()
    private aliases: Collection<string, string> = new Collection<string, string>()

    public registerAllCommands(): void{
        // TODO::Auto Loader
        CommandHandler.COMMANDS.forEach(command => {
            this.registerCommand(command)
        })

        this.client.logger.info(`Toplam ${Colors.LIGHT_PURPLE}${this.commands.keyArray().length} ${Colors.AQUA}komut başarıyla yüklendi.`)
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

        if(!(message.channel instanceof TextChannel)){
            return
        }

        const server = await client.servers.get(message.guild.id)
        const prefix = (client.isDevBuild ? 'dev' : '') + (server.prefix || client.prefix)

        if(!message.content.startsWith(prefix)){
            if(message.content === Constants.PREFIX_COMMAND){
                await message.channel.send(`🌈   Botun sunucu içerisinde ki komut ön adı(prefix): **${server.prefix}**`)
            }

            return
        }

        if(!message.member){
            return
        }

        const channel_id: string = this.client.getSetupManager().getSetupChannel(message.member.id)
        if(channel_id && channel_id === message.channel.id){ // check setup
            return
        }

        const args: string[] = message.content
            .slice(prefix.length)
            .trim()
            .split(/ +/g)
        const cmd = args.shift().toLowerCase()

        if(cmd.length === 0){
            return
        }

        let command: Command | undefined = this.commands.get(cmd);
        if(!command){ // control is alias command
            command = this.commands.get(this.aliases.get(cmd))
        }

        if(command){
            const authorized: boolean = command.hasPermission(message.member) || message.member.roles.cache.filter(role => {
                return role.name.trim().toLowerCase() === Constants.PERMITTED_ROLE_NAME
            }).size !== 0 || server.publicCommands.indexOf(command.name) !== -1
            if(authorized){
                const checkPermissions = this.getPermissionController().checkSelfPermissions(
                    message.guild,
                    message.channel
                )
                if(checkPermissions.has){
                    command.run(client, server, message, args).then(async (result: boolean) => {
                        if(!result){
                            await message.channel.send({
                                embed: command.getUsageEmbed()
                            })
                        }
                    })
                }else{
                    if(checkPermissions.missing.includes('SEND_MESSAGES') || checkPermissions.missing.includes('VIEW_CHANNEL')){
                        await message.author
                            .send(`Botun çalışabilmesi için '**${message.channel.name}**' kanalında bota '**Mesaj Gönder**' yetkisini sağlamanız/vermeniz gerekiyor. Aksi takdirde bot bu kanala mesaj gönderemez ve işlevini yerine getiremez/çalışamaz.`)
                            .catch(() => {})
                    }else{
                        await message.channel.send([
                            'Botun çalışabilmesi için gerekli olan **izinler** eksik. Lütfen aşağıda ki listede bulunan izinleri bota sağlayıp/verip tekrar deneyin.',
                            `\n${checkPermissions}\n`,
                            'Eğer daha detaylı yardıma ihtiyacınız varsa bizle iletişime geçmekten çekinmeyin.'
                        ].join('\n'))
                    }
                }
            }else{
                await message.channel.send({
                    embed: command.getErrorEmbed('Bu komutu kullanmak için **yetkiniz** yok.')
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

}
