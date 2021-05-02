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
import CommandHandler from './command/CommandHandler';
import ActivityUpdater from './updater/ActivityUpdater';
import RaffleTimeUpdater from './updater/RaffleTimeUpdater';
import ServerManager from './managers/ServerManager';
import SetupManager from './setup/SetupManager';
import SyntaxWebhook from './SyntaxWebhook';
import PremiumUpdater from './updater/PremiumUpdater';
import LanguageManager from './language/LanguageManager';
import ClientTaskManager from './scheduler/managers/ClientTaskManager';

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

    private resolveEval = <T>(value: any[]): T | undefined => value.find(res => !!res)

    /**
     * Finds the server on the whole client.
     *
     * @param guildID {Snowflake}
     */
    async fetchGuild(guildID: Snowflake): Promise<Guild | undefined>{
        const fetch = await this.shard.broadcastEval(`this.guilds.cache.get("${guildID}")`)

        return this.resolveEval(fetch)
    }

    /**
     * Finds the guild member on the whole client.
     *
     * @param guildID
     * @param memberID
     */
    async fetchMember(guildID: Snowflake, memberID: Snowflake){
        const fetch = await this.shard.broadcastEval(`(async () => {
            const guild = this.guilds.cache.get("${guildID}")
            if(guild) return guild.members.fetch("${memberID}").then(user => user).catch(() => {
                return undefined
            })
            
            return undefined
        })()`)

        return this.resolveEval(fetch)
    }

    /**
     * Text channel election
     *
     * @param guild
     */
    textChannelElection(guild: Guild): TextChannel | undefined{
        // @ts-ignore
        return guild.channels.cache
            .filter(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'))
            .sort((a, b) => a.position > b.position ? 1 : -1)
            .first()
    }

    /**
     * It only finds channels on servers in the shard.
     *
     * @param guildID   {Snowflake}
     * @param channelID {Snowflake}
     */
    fetchChannel<T extends Snowflake>(guildID: T, channelID: T): GuildChannel | undefined{
        const guild: Guild = this.guilds.cache.get(guildID)
        if(guild){
            const channel = guild.channels.cache.get(channelID)
            if(channel && channel.viewable) return channel
        }

        return undefined
    }

    /**
     * It only finds messages on servers in the shard.
     *
     * @param guildID
     * @param channelID
     * @param messageID
     */
    async fetchMessage<T extends Snowflake>(guildID: T, channelID: T, messageID: T): Promise<Message | undefined>{
        const channel: GuildChannel = this.fetchChannel(guildID, channelID)
        if(channel instanceof TextChannel){
            return new Promise(resolve => {
                return channel.messages
                    .fetch(messageID, false, true)
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
