import ascii from 'ascii-table'
import { Command } from '../commands/Command'
import { CancelRaffle } from '../commands/admin/CancelRaffle';
import { CreateRaffle } from '../commands/admin/CreateRaffle';
import { ReRollRaffle } from '../commands/admin/ReRollRaffle';
import { EndRaffle } from '../commands/admin/EndRaffle';
import { Raffles } from '../commands/public/Raffles';
import { Help } from '../commands/public/Help';
import { Vote } from '../commands/admin/Vote';
import { SetupRaffle } from '../commands/admin/SetupRaffle';
import { SuperClient } from '../Asena';
import Handler from './Handler';
import { Message } from 'discord.js';
import { BotInfo } from '../commands/public/BotInfo';
import Constants from '../Constants';
import CommandRunner from '../commands/CommandRunner';
import { Question } from '../commands/admin/Question';

export class CommandHandler extends Handler implements CommandRunner{

    // noinspection JSPotentiallyInvalidConstructorUsage
    private readonly table: ascii = new ascii('Komutlar')
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
        new BotInfo()
    ]

    public load(): void{
        CommandHandler.COMMANDS.forEach(command => {
            this.client.commands.set(command.name, command);
            this.table.addRow(command.name, '✅');

            if(command.aliases && Array.isArray(command.aliases)){
                command.aliases.forEach(alias => this.client.aliases.set(alias, command.name));
            }
        })

        console.log(this.table.toString());
    }

    public run(message: Message): void{
        const client: SuperClient = this.client

        if(message.guild === null){
            return
        }

        if(message.author.bot){
            return
        }

        if(!message.content.startsWith(client.prefix)){
            return
        }

        if(!message.member){
            return // eğer komut çalışmazsa buraya bak
        }

        // check setup
        const channel_id: string = client.setups.get(message.member.id)
        if(channel_id && channel_id === message.channel.id){
            return
        }

        const args: string[] = message.content
            .slice(client.prefix.length)
            .trim()
            .split(/ +/g)
        const cmd = args.shift().toLowerCase()

        if(cmd.length === 0){
            return
        }

        let command: Command | undefined = client.commands.get(cmd);
        if(!command){ // control is alias command
            command = client.commands.get(client.aliases.get(cmd))
        }

        if(command){
            const authorized: boolean = command.hasPermission(message.member) || message.member.roles.cache.filter(role => {
                return role.name.trim().toLowerCase() === Constants.PERMITTED_ROLE_NAME
            }).size !== 0
            if(authorized){
                command.run(client, message, args).then(async (result: boolean) => {
                    if(!result){
                        await message.channel.send({
                            embed: client.helpers.message.getCommandUsageEmbed(command)
                        })
                    }
                })
            }else{
                // noinspection JSIgnoredPromiseFromCall
                message.channel.send({
                    embed: client.helpers.message.getErrorEmbed('Bu komutu kullanmak için **yetkiniz** yok.')
                })
            }
        }
    }

    public getLoadedCommands(): Command[]{
        return CommandHandler.COMMANDS
    }

}