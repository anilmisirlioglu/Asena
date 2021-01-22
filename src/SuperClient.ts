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
import TaskTiming from './tasks/TaskTiming';
import CommandHandler from './command/CommandHandler';
import ActivityUpdater from './updater/ActivityUpdater';
import RaffleTimeUpdater from './updater/RaffleTimeUpdater';
import ServerManager from './managers/ServerManager';
import SetupManager from './setup/SetupManager';
import SyntaxWebhook from './SyntaxWebhook';
import PremiumUpdater from './updater/PremiumUpdater';
import LanguageManager from './language/LanguageManager';

interface SuperClientBuilderOptions{
    prefix: string
    isDevBuild: boolean
}

export default abstract class SuperClient extends Client{

    readonly prefix: string = this.opts.prefix
    readonly isDevBuild: boolean = this.opts.isDevBuild

    readonly version: Version = new Version(process.env.npm_package_version || '1.0.0', this.opts.isDevBuild)

    readonly logger: Logger = new Logger('shard')

    private readonly taskTiming: TaskTiming = new TaskTiming()

    private readonly commandHandler: CommandHandler = new CommandHandler(this)

    private readonly activityUpdater: ActivityUpdater = new ActivityUpdater(this)
    private readonly raffleTimeUpdater: RaffleTimeUpdater = new RaffleTimeUpdater(this)
    private readonly premiumUpdater: PremiumUpdater = new PremiumUpdater(this)

    readonly servers: ServerManager = new ServerManager()

    private readonly setupManager: SetupManager = new SetupManager()
    private readonly languageManager: LanguageManager = new LanguageManager(this)

    readonly webhook: SyntaxWebhook = new SyntaxWebhook()

    static NAME: string
    static AVATAR: string

    private static self: SuperClient

    protected constructor(private opts: SuperClientBuilderOptions){
        super({
            partials: ['CHANNEL', 'MESSAGE', 'REACTION', 'GUILD_MEMBER'],
            ws: {
                intents: [
                    'GUILDS',
                    'GUILD_MESSAGES',
                    'GUILD_MESSAGE_REACTIONS',
                    'GUILD_EMOJIS',
                    'GUILD_WEBHOOKS'
                ]
            },
            messageCacheMaxSize: 1024,
            messageCacheLifetime: 600,
            messageSweepInterval: 300
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

    public getTaskTiming(): TaskTiming{
        return this.taskTiming
    }

    public getActivityUpdater(): ActivityUpdater{
        return this.activityUpdater
    }

    public getRaffleTimeUpdater(): RaffleTimeUpdater{
        return this.raffleTimeUpdater
    }

    public getPremiumUpdater(): PremiumUpdater{
        return this.premiumUpdater
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

    fetchChannel<T extends Snowflake>(guildId: T, channelId: T): GuildChannel | undefined{
        const guild: Guild = this.guilds.cache.get(guildId)
        if(guild){
            const channel = guild.channels.cache.get(channelId)
            if(channel && channel.viewable) return channel
        }

        return undefined
    }

    async fetchMessage<T extends Snowflake>(guildId: T, channelId: T, messageId: T): Promise<Message | undefined>{
        const channel: GuildChannel = this.fetchChannel(guildId, channelId)
        if(channel instanceof TextChannel){
            return new Promise(resolve => {
                return channel.messages
                    .fetch(messageId)
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
