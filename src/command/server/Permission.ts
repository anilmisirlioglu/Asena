import { CommandInteraction } from 'discord.js'
import Command, { Group, Result } from '../Command'
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

    async run(client: SuperClient, server: Server, action: CommandInteraction): Promise<Result>{
        const state: string = action.options.getString('state', true).trim().toLowerCase()
        const command: string = action.options.getString('command', true).trim().toLowerCase()

        const commandAuth: Command[] = client.getCommandHandler().getCommandsArray().filter($command => $command.name === command)
        if(commandAuth.length === 0){
            return this.error('commands.server.permission.command.not.found')
        }

        const $command: Command = commandAuth.shift()
        if(!$command.permission || this.name === $command.name){
            return this.error('commands.server.permission.command.not.editable')
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
            return this.error('commands.server.permission.command.already', opcl)
        }

        await Promise.all([
            (add ? server.addPublicCommand($command.name) : server.deletePublicCommand($command.name)),
            action.reply('🌈  ' + server.translate('commands.server.permission.command.success', $command.name, opcl))
        ])
        return null
    }

}
