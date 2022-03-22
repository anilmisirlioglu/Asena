import { Routes } from 'discord-api-types/v9';
import { isDevBuild } from '../src/utils/Version';
import { SlashCommandBuilder } from '@discordjs/builders';
import Pool from '../src/utils/Pool';
import ApplicationCommand from './ApplicationCommand';
const { REST } = require('@discordjs/rest');

export default class Distributor{

    private commands = []

    private rest = new REST({ version: 9 })

    public constructor(){
        this.rest.setToken(process.env.TOKEN);
    }

    async publish(){
        return this.rest.put(this.applicationGuildCommands, {
            body: this.commands
        })
    }

    // noinspection JSMethodCanBeStatic
    private get applicationGuildCommands(): string{
        if(isDevBuild){
            return Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
        }

        return Routes.applicationCommands(process.env.CLIENT_ID)
    }

    registerCommands(pool: Pool<ApplicationCommand>){
        for(const cmd of pool){
            this.registerCommand(cmd)
        }
    }

    registerCommand(cmd: SlashCommandBuilder){
        this.commands.push(cmd.toJSON())
    }

}