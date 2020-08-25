import { Collection, Message, TextChannel } from 'discord.js';

import CommandRunner from './CommandRunner';
import Command from './Command';
import { Colors } from '../utils/TextFormat';
import SuperClient from '../SuperClient';
import Constants from '../Constants';
import Factory from '../Factory';
import { ICommandPremium } from '../decorators/Premium';
import SetCommandPermission from './server/SetCommandPermission';
import PermissionController from '../controllers/PermissionController';

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
import Invitation from './bot/Invitation';
import Premium from './server/Premium';
import EditRaffle from './raffle/EditRaffle';
import AdvancedCreateRaffle from './raffle/AdvancedCreateRaffle';

type CommandMap = Collection<string, Command>

export default class CommandHandler extends Factory implements CommandRunner{

    private static readonly COMMANDS: Command[] = [
        new CancelRaffle(),
        new CreateRaffle(),
        new AdvancedCreateRaffle(),
        new ReRollRaffle(),
        new SetupRaffle(),
        new EndRaffle(),
        new EditRaffle(),
        new Raffles(),
        new Vote(),
        new Question(),
        new Help(),
        new BotInfo(),
        new Invitation(),
        new SetPrefix(),
        new SetCommandPermission(),
        new Premium()
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

        const prefix = (client.isDevBuild ? 'dev' : '') + (server.prefix || client.prefix)
        if(!message.content.startsWith(prefix)){
            if(message.content === Constants.PREFIX_COMMAND){
                await channel.send(`🌈   Botun sunucu içerisinde ki komut ön adı(prefix): **${server.prefix}**`)
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

        let command: Command & ICommandPremium | undefined = this.commands.get(cmd) as Command & ICommandPremium;
        if(!command){ // control is alias command
            command = this.commands.get(this.aliases.get(cmd)) as Command & ICommandPremium;
        }

        if(command){
            const authorized: boolean = command.hasPermission(message.member) || message.member.roles.cache.filter(role => {
                return role.name.trim().toLowerCase() === Constants.PERMITTED_ROLE_NAME
            }).size !== 0 || server.isPublicCommand(command.name)
            if(authorized){
                const checkPermissions = this.getPermissionController().checkSelfPermissions(
                    message.guild,
                    message.channel
                )
                if(checkPermissions.has){
                    if(!command.premium || (command.premium && server.isPremium())){
                        command.run(client, server, message, args).then(async (result: boolean) => {
                            if(!result){
                                await channel.send({
                                    embed: command.getUsageEmbed()
                                })
                            }
                        })
                    }else{
                        await channel.send({
                            embed: command.getPremiumEmbed()
                        })
                    }
                }else{
                    if(checkPermissions.missing.includes('SEND_MESSAGES') || checkPermissions.missing.includes('VIEW_CHANNEL')){
                        try{
                            message.author.createDM().then(dmChannel => {
                                dmChannel.send(`Botun çalışabilmesi için '**${channel.name}**' kanalında bota '**Mesaj Gönder**' yetkisini sağlamanız/vermeniz gerekiyor. Aksi takdirde bot bu kanala mesaj gönderemez ve işlevini yerine getiremez/çalışamaz.`)
                            })
                        }catch(e){}
                    }else{
                        await channel.send([
                            'Botun çalışabilmesi için gerekli olan **izinler** eksik. Lütfen aşağıda ki listede bulunan izinleri bota sağlayıp/verip tekrar deneyin.',
                            `\n${checkPermissions}\n`,
                            'Eğer daha detaylı yardıma ihtiyacınız varsa bizimle iletişime geçmekten çekinmeyin.'
                        ].join('\n'))
                    }
                }
            }else{
                await channel.send({
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
