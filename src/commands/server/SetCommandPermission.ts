import { Command } from '../Command';
import { SuperClient } from '../../Asena';
import { Message, Snowflake } from 'discord.js';

export default class SetCommandPermission extends Command{

    constructor(){
        super({
            name: 'scperm',
            aliases: ['setcommmandpermission', 'setcommandperm'],
            description: 'Komutu izinlerini düzenler.',
            usage: '[everyone | admin] [komut]',
            permission: 'ADMINISTRATOR'
        });
    }

    async run(client: SuperClient, message: Message, args: string[]): Promise<boolean>{
        if(args.length < 2) return false

        const cluster: string = args[0].trim().toLowerCase()
        if(['everyone', 'admin'].indexOf(cluster) === -1) return false

        const command: string = args[1].trim().toLowerCase()
        const commands: Command[] = client.getCommandHandler().commands

        const commandAuth: Command[] = commands.filter($command => $command.name === command)
        if(commandAuth.length === 0){
            await message.channel.send({
                embed: this.getErrorEmbed('Komut bulunamadı.')
            })

            return true
        }

        const $command: Command = commandAuth.shift()
        if(!$command.permission || this.name === $command.name){
            await message.channel.send({
                embed: this.getErrorEmbed('Bu komutun izinlerini düzenleyemezsin.')
            })

            return true
        }

        const guildId: Snowflake = message.guild.id
        const server = await client.getServerManager().getServerData(guildId)
        const commandStatus: number = server.publicCommands.indexOf(command)

        let opcl: string, err: boolean = false, type
        switch(cluster){
            case 'everyone':
                if(commandStatus !== -1){
                    err = true
                    opcl = 'açık'
                }

                type = 'ADD'
                break

            default:
                if(commandStatus === -1){
                    err = true
                    opcl = 'kapalı'
                }

                type = 'DELETE'
                break
        }

        if(err){
            await message.channel.send({
                embed: this.getErrorEmbed(`Bu komut zaten herkese **${opcl}**.`)
            })

            return true
        }

        await client.getServerManager().setPublicCommandServer(guildId, $command.name, type)
        await message.channel.send(`🌈  '**${$command.name}**' komutunun izinleri başarıyla düzenlendi. Komut durumu: **Herkese ${type === 'ADD' ? 'açık' : 'kapalı'}**`)

        return true
    }

}