import {
    Client,
    Collection,
} from 'discord.js';

import { Logger } from './utils/Logger';
import { Version } from './utils/Version';
import { MessageHelper } from './helpers/MessageHelper';
import { ChannelHelper } from './helpers/ChannelHelper';
import { RaffleHelper } from './helpers/RaffleHelper';
import { CommandHandler } from './handlers/CommandHandler';
import { GuildHandler } from './handlers/GuildHandler';
import { Command } from './commands/Command';
import connection from './connection';
import { RaffleHandler } from './handlers/RaffleHandler';
import SyntaxWebHook from './SyntaxWebhook';
import RaffleManager from './managers/RaffleManager';

interface IHelper{
    readonly message: MessageHelper
    readonly channel: ChannelHelper
    readonly raffle: RaffleHelper
}

interface IHandler{
    readonly command: CommandHandler
    readonly guild: GuildHandler
    readonly raffle: RaffleHandler
}

interface IManager{
    readonly raffle: RaffleManager
}

interface SuperClientBuilderOptions{
    prefix: string
    isDevBuild: boolean
}

export abstract class SuperClient extends Client{

    readonly prefix: string = this.opts.prefix

    readonly version: Version = new Version(process.env.npm_package_version || '1.0.0', this.opts.isDevBuild)

    readonly logger: Logger = new Logger()

    readonly commands: Collection<string, Command> = new Collection<string, Command>()
    readonly aliases: Collection<string, string> = new Collection<string, string>()
    readonly setups: Collection<string, string> = new Collection<string, string>()

    readonly helpers: IHelper = {
        message: new MessageHelper(this),
        channel: new ChannelHelper(this),
        raffle: new RaffleHelper(this)
    }

    readonly handlers: IHandler = {
        command: new CommandHandler(this),
        guild: new GuildHandler(this),
        raffle: new RaffleHandler(this)
    }

    readonly managers: IManager = {
        raffle: new RaffleManager(this)
    }

    readonly webHook: SyntaxWebHook = new SyntaxWebHook()

    protected constructor(private opts: SuperClientBuilderOptions){
        super()
    }

}

export default class Asena extends SuperClient{

    constructor(){
        // noinspection JSIgnoredPromiseFromCall
        connection() // prepare conn

        const isDev = (process.argv[2] ?? null) === 'dev'
        super({
            prefix: (isDev ? 'dev' : '') + process.env.PREFIX ?? '!a',
            isDevBuild: isDev
        })

        // Guild counter start
        this.handlers.guild.start()

        // Load commands
        this.handlers.command.load()

        // Command run
        this.on('message', async message => {
            this.handlers.command.run(message)
        })

        // start raffle schedule
        this.handlers.raffle.startJobSchedule()
    }

}