import ascii from 'ascii-table';
import { Message } from 'discord.js';
import { Command } from '../commands/Command';
import { SuperClient } from '../Asena';
import Handler from './Handler';
import Constants from '../Constants';
import CommandRunner from '../commands/CommandRunner';

import CancelRaffle from '../commands/raffle/CancelRaffle';
import CreateRaffle from '../commands/raffle/CreateRaffle';
import ReRollRaffle from '../commands/raffle/ReRollRaffle';
import SetupRaffle from '../commands/raffle/SetupRaffle';
import EndRaffle from '../commands/raffle/EndRaffle';
import Raffles from '../commands/raffle/Raffles';
import Vote from '../commands/survey/Vote';
import Question from '../commands/survey/Question';
import Help from '../commands/bot/Help';
import BotInfo from '../commands/bot/BotInfo';
import SetPrefix from '../commands/server/SetPrefix';
import SetCommandPermission from '../commands/server/SetCommandPermission';

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
        new BotInfo(),
        new SetPrefix(),
        new SetCommandPermission()
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

    public async run(message: Message){
        const client: SuperClient = this.client

        if(message.guild === null){
            return
        }

        if(message.author.bot){
            return
        }

        const server = await client.getServerManager().getServerData(message.guild.id)
        const prefix = (client.isDevBuild ? 'dev' : '') + (server.prefix || client.prefix)

        if(!message.content.startsWith(prefix)){
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
            .slice(prefix.length)
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
            }).size !== 0 || server.publicCommands.indexOf(command.name) !== -1
            if(authorized){
                command.run(client, message, args).then(async (result: boolean) => {
                    if(!result){
                        await message.channel.send({
                            embed: client.getMessageHelper().getCommandUsageEmbed(command)
                        })
                    }
                })
            }else{
                await message.channel.send({
                    embed: client.getMessageHelper().getErrorEmbed('Bu komutu kullanmak için **yetkiniz** yok.')
                })
            }
        }
    }

    public get commands(): Command[]{
        return CommandHandler.COMMANDS
    }

}