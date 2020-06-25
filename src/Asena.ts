import { Client, Collection, Guild, GuildChannel, Message, Snowflake, TextChannel, } from 'discord.js';

import Logger from './utils/Logger';
import Version from './utils/Version';
import { Command } from './commands/Command';
import connection from './connection';
import SyntaxWebHook from './SyntaxWebhook';
import { IHelper } from './helpers/Helper';
import { IHandler } from './handlers/Handler';
import { IManager } from './managers/Manager';
import RaffleManager from './managers/RaffleManager';
import { GuildHandler } from './handlers/GuildHandler';
import { RaffleHandler } from './handlers/RaffleHandler';
import { RaffleHelper } from './helpers/RaffleHelper';
import ServerManager from './managers/ServerManager';
import { SurveyHelper } from './helpers/SurveyHelper';
import { SurveyHandler } from './handlers/SurveyHandler';
import CommandHandler from './commands/CommandHandler';

interface SuperClientBuilderOptions{
    prefix: string
    isDevBuild: boolean
}

export abstract class SuperClient extends Client{

    readonly prefix: string = this.opts.prefix
    readonly isDevBuild: boolean = this.opts.isDevBuild

    readonly version: Version = new Version(process.env.npm_package_version || '1.0.0', this.opts.isDevBuild)

    readonly logger: Logger = new Logger()

    readonly commands: Collection<string, Command> = new Collection<string, Command>()
    readonly aliases: Collection<string, string> = new Collection<string, string>()
    readonly setups: Collection<string, string> = new Collection<string, string>()

    private readonly helpers: IHelper = {
        raffle: new RaffleHelper(this),
        survey: new SurveyHelper(this)
    }

    private readonly handlers: IHandler = {
        guild: new GuildHandler(this),
        raffle: new RaffleHandler(this),
        survey: new SurveyHandler(this),
        command: new CommandHandler(this)
    }

    private readonly managers: IManager = {
        raffle: new RaffleManager(this),
        server: new ServerManager(this)
    }

    readonly webHook: SyntaxWebHook = new SyntaxWebHook()
    private static self: SuperClient

    protected constructor(private opts: SuperClientBuilderOptions){
        super()

        SuperClient.self = this
    }

    public static getInstance(): SuperClient{
        return this.self
    }

    /* MANAGERS */
    public getRaffleManager(): RaffleManager{
        return this.managers.raffle
    }

    public getServerManager(): ServerManager{
        return this.managers.server
    }

    /* HANDLERS */
    public getGuildHandler(): GuildHandler{
        return this.handlers.guild
    }

    public getRaffleHandler(): RaffleHandler{
        return this.handlers.raffle
    }

    public getSurveyHandler(): SurveyHandler{
        return this.handlers.survey
    }

    public getCommandHandler(): CommandHandler{
        return this.handlers.command
    }

    /* HELPERS */

    public getRaffleHelper(): RaffleHelper{
        return this.helpers.raffle
    }

    public getSurveyHelper(): SurveyHelper{
        return this.helpers.survey
    }

    public fetchChannel<T extends Snowflake>(guildId: T, channelId: T): GuildChannel | undefined{
        const guild: Guild = this.guilds.cache.get(guildId)
        if(guild){
            return guild.channels.cache.get(channelId)
        }

        return undefined
    }

    public fetchMessage<T extends Snowflake>(guildId: T, channelId: T, messageId: T): Promise<Message | undefined>{
        const guild: Guild = this.guilds.cache.get(guildId)
        if(guild){
            const channel: GuildChannel = guild.channels.cache.get(channelId)
            if(channel instanceof TextChannel){
                return channel.messages.fetch(messageId)
            }
        }

        return undefined
    }

}

export default class Asena extends SuperClient{

    constructor(){
        connection() // prepare conn

        super({
            prefix: process.env.PREFIX ?? '!a',
            isDevBuild: process.argv.includes('dev')
        })

        // Guild counter start
        this.getGuildHandler().start()

        // Command run
        this.on('message', async message => {
            await this.getCommandHandler().run(message)
        })

        // Delete server data from db
        this.on('guildDelete', async guild => {
            await this.getServerManager().deleteServerData(guild.id)
        })

        // start schedulers
        this.getRaffleHandler().startJobSchedule()
        this.getSurveyHandler().startJobSchedule()
    }

}