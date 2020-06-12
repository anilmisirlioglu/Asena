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

interface IHelper<C extends SuperClient>{
    readonly message: MessageHelper<C>
    readonly channel: ChannelHelper<C>
    readonly raffle: RaffleHelper<C>
}

interface IHandler<C extends SuperClient>{
    readonly command: CommandHandler<C>
    readonly guild: GuildHandler<C>
    readonly raffle: RaffleHandler<C>
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
    readonly helpers: IHelper<SuperClient> = {
        message: new MessageHelper<SuperClient>(this),
        channel: new ChannelHelper<SuperClient>(this),
        raffle: new RaffleHelper<SuperClient>(this)
    }
    readonly handlers: IHandler<SuperClient> = {
        command: new CommandHandler<SuperClient>(this),
        guild: new GuildHandler<SuperClient>(this),
        raffle: new RaffleHandler<SuperClient>(this)
    }

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