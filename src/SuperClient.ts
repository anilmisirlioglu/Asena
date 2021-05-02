import {
    Client,
    DiscordAPIError,
    Guild,
    GuildChannel,
    HTTPError,
    Message,
    MessageEmbed,
    Snowflake,
    TextChannel
} from "discord.js";
import Version from './utils/Version';
import Logger from './utils/Logger';
import CommandHandler from './commands/CommandHandler';
import ActivityUpdater from './updater/ActivityUpdater';
import RaffleTimeUpdater from './updater/RaffleTimeUpdater';
import ServerManager from './managers/ServerManager';
import SetupManager from './setup/SetupManager';
import SyntaxWebhook from './SyntaxWebhook';
import LanguageManager from './language/LanguageManager';
import ClientTaskManager from './scheduler/manager/ClientTaskManager';

interface SuperClientBuilderOptions{
    prefix: string
    isDevBuild: boolean
}

export default abstract class SuperClient extends Client{

    readonly prefix: string = this.opts.prefix
    readonly isDevBuild: boolean = this.opts.isDevBuild

    readonly version: Version = new Version(process.env.npm_package_version || '1.0.0', this.opts.isDevBuild)

    readonly logger: Logger = new Logger('shard')

    private readonly taskManager: ClientTaskManager = new ClientTaskManager()

    private readonly commandHandler: CommandHandler = new CommandHandler(this)

    private readonly activityUpdater: ActivityUpdater = new ActivityUpdater(this)
    private readonly raffleTimeUpdater: RaffleTimeUpdater = new RaffleTimeUpdater(this)

    readonly servers: ServerManager = new ServerManager()
    private readonly setupManager: SetupManager = new SetupManager()

    readonly webhook: SyntaxWebhook = new SyntaxWebhook()

    private readonly languageManager: LanguageManager = new LanguageManager(this)

    static NAME: string
    static AVATAR: string

    private static self: SuperClient

    protected constructor(private opts: SuperClientBuilderOptions){
        super({
            partials: ['MESSAGE', 'REACTION'],
            ws: {
                intents: [
                    'GUILDS',
                    'GUILD_MESSAGES',
                    'GUILD_MESSAGE_REACTIONS',
                    'GUILD_EMOJIS',
                    'GUILD_VOICE_STATES'
                ]
            },
            messageCacheMaxSize: 25,
            messageCacheLifetime: 300,
            messageSweepInterval: 240,
            messageEditHistoryMaxSize: 0
        })
    }

    protected init(){
        SuperClient.NAME = this.user.username
        SuperClient.AVATAR = this.user.avatarURL()

        SuperClient.self = this
    }

    public static getInstance(): SuperClient{
        return this.self
    }

    public getTaskManager(): ClientTaskManager{
        return this.taskManager
    }

    public getActivityUpdater(): ActivityUpdater{
        return this.activityUpdater
    }

    public getRaffleTimeUpdater(): RaffleTimeUpdater{
        return this.raffleTimeUpdater
    }

    public getCommandHandler(): CommandHandler{
        return this.commandHandler
    }

    public getSetupManager(): SetupManager{
        return this.setupManager
    }

    public getLanguageManager(): LanguageManager{
        return this.languageManager
    }

    textChannelElection(guild: Guild): TextChannel | undefined{
        // @ts-ignore
        return guild.channels.cache
            .filter(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'))
            .sort((a, b) => a.position > b.position ? 1 : -1)
            .first()
    }

    fetchChannel<T extends Snowflake>(guildId: T, channelId: T): GuildChannel | undefined{
        const guild: Guild = this.guilds.cache.get(guildId)
        if(guild){
            const channel = guild.channels.cache.get(channelId)
            if(channel instanceof TextChannel && channel.viewable) return channel
        }

        return undefined
    }

    async fetchMessage<T extends Snowflake>(guildId: T, channelId: T, messageId: T): Promise<Message | undefined>{
        const channel: GuildChannel = this.fetchChannel(guildId, channelId)
        if(channel instanceof TextChannel){
            return new Promise(resolve => {
                return channel.messages
                    .fetch(messageId, false, true)
                    .catch(() => resolve(undefined))
                    .then((message: Message) => resolve(message))
            })
        }

        return undefined
    }

    buildErrorReporterEmbed(lang: string, guild: Guild, err: DiscordAPIError | HTTPError): MessageEmbed{
        return new MessageEmbed()
            .setAuthor(`${this.user.username} | ${LanguageManager.translate(lang, "errors.reporter.title")}`, this.user.avatarURL())
            .setColor('DARK_RED')
            .setFooter(guild.name, guild.iconURL())
            .setTimestamp()
            .setDescription(LanguageManager.translate(lang, "errors.reporter.description", ...[
                err.name,
                err.message,
                err.method,
                err.path,
                err.code,
                err.path
            ]))
    }

}
