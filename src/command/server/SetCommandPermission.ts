import { Message } from 'discord.js'
import Command from '../Command'
import SuperClient from '../../SuperClient'
import Server from '../../structures/Server'

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

    async run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>{
        if(args.length < 2) return false

        const cluster: string = args[0].trim().toLowerCase()
        if(['everyone', 'admin'].indexOf(cluster) === -1) return false

        const command: string = args[1].trim().toLowerCase()
        const commands: Command[] = client.getCommandHandler().getCommandsArray()

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

        let opcl: string, err: boolean = false, add: boolean
        switch(cluster){
            case 'everyone':
                if(server.isPublicCommand(command)){
                    err = true
                    opcl = 'açık'
                }

                add = true
                break

            default:
                if(!server.isPublicCommand(command)){
                    err = true
                    opcl = 'kapalı'
                }

                add = false
                break
        }

        if(err){
            await message.channel.send({
                embed: this.getErrorEmbed(`Bu komut zaten herkese **${opcl}**.`)
            })
            return true
        }

        await Promise.all([
            (add ? server.addPublicCommand($command.name) : server.deletePublicCommand($command.name)),
            message.channel.send(`🌈  '**${$command.name}**' komutunun izinleri başarıyla düzenlendi. Komut durumu: **Herkese ${add ? 'açık' : 'kapalı'}**`)
        ])
        return true
    }

}
