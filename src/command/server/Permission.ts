import { CommandInteraction } from 'discord.js'
import Command, { Group } from '../Command'
import SuperClient from '../../SuperClient'
import Server from '../../structures/Server'

export default class Permission extends Command{

    constructor(){
        super({
            name: 'permission',
            group: Group.SERVER,
            description: 'commands.server.permission.description',
            permission: 'ADMINISTRATOR',
            examples: [
                'state: everyone command: create',
                'state: admin command: survey',
            ]
        })
    }

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<boolean>{
        const state: string = action.options.getString('state', true).trim().toLowerCase()
        const command: string = action.options.getString('command', true).trim().toLowerCase()

        const commandAuth: Command[] = client.getCommandHandler().getCommandsArray().filter($command => $command.name === command)
        if(commandAuth.length === 0){
            await action.reply({
                embeds: [this.getErrorEmbed(server.translate('commands.server.permission.command.not.found'))]
            })
            return true
        }

        const $command: Command = commandAuth.shift()
        if(!$command.permission || this.name === $command.name){
            await action.reply({
                embeds: [this.getErrorEmbed(server.translate('commands.server.permission.command.not.editable'))]
            })
            return true
        }

        let opcl: string, err: boolean = false, add: boolean
        switch(state){
            case 'everyone':
                if(server.isPublicCommand(command)) err = true

                opcl = server.translate('global.open')
                add = true
                break

            default:
                if(!server.isPublicCommand(command)) err = true

                opcl = server.translate('global.close')
                add = false
                break
        }

        if(err){
            await action.reply({
                embeds: [this.getErrorEmbed(server.translate('commands.server.permission.command.already', opcl))]
            })
            return true
        }

        await Promise.all([
            (add ? server.addPublicCommand($command.name) : server.deletePublicCommand($command.name)),
            action.reply('🌈  ' + server.translate('commands.server.permission.command.success', $command.name, opcl))
        ])
        return true
    }

}
