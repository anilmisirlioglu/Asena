import {
    ChannelType,
    Client,
    Colors,
    DiscordAPIError,
    EmbedBuilder,
    Guild,
    GuildChannel, GuildMember,
    HTTPError,
    IntentsBitField,
    Message,
    Options,
    Partials,
    PermissionsBitField,
    Snowflake,
    TextChannel
} from 'discord.js';
import Version from './utils/Version';
import Logger from './utils/Logger';
import CommandHandler from './command/CommandHandler';
import ActivityUpdater from './updater/ActivityUpdater';
import GiveawayTimeUpdater from './updater/GiveawayTimeUpdater';
import ServerManager from './managers/ServerManager';
import SetupManager from './setup/SetupManager';
import SyntaxWebhook from './SyntaxWebhook';
import PremiumUpdater from './updater/PremiumUpdater';
import LanguageManager from './language/LanguageManager';
import ClientTaskManager from './scheduler/managers/ClientTaskManager';
import InteractionHandler from './interaction/InteractionHandler';

interface SuperClientBuilderOptions{
    isDevBuild: boolean
}

export default abstract class SuperClient extends Client{

    readonly isDevBuild: boolean = this.opts.isDevBuild

    readonly version: Version = new Version(process.env.npm_package_version || '1.0.0', this.opts.isDevBuild)

    readonly logger: Logger = new Logger('shard')

    private readonly taskManager: ClientTaskManager = new ClientTaskManager()

    private readonly commandHandler: CommandHandler = new CommandHandler(this)
    private readonly interactionHandler: InteractionHandler = new InteractionHandler(this)

    private readonly activityUpdater: ActivityUpdater = new ActivityUpdater(this)
    private readonly giveawayTimeUpdater: GiveawayTimeUpdater = new GiveawayTimeUpdater(this)
    private readonly premiumUpdater: PremiumUpdater = new PremiumUpdater(this)

    readonly servers: ServerManager = new ServerManager()

    private readonly setupManager: SetupManager = new SetupManager()
    private readonly languageManager: LanguageManager = new LanguageManager(this)

    readonly webhook: SyntaxWebhook = new SyntaxWebhook()

    private static self: SuperClient

    protected constructor(private opts: SuperClientBuilderOptions){
        super({
            makeCache: Options.cacheWithLimits({
                MessageManager: 200,
                PresenceManager: 0
            }),
            partials: [Partials.Message],
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildVoiceStates
            ]
        })
    }

    protected init(){
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

    public getGiveawayTimeUpdater(): GiveawayTimeUpdater{
        return this.giveawayTimeUpdater
    }

    public getPremiumUpdater(): PremiumUpdater{
        return this.premiumUpdater
    }

    public getCommandHandler(): CommandHandler{
        return this.commandHandler
    }

    public getInteractionHandler(): InteractionHandler{
        return this.interactionHandler
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
        const fetch = await this.shard.broadcastEval((client, guildID) => client.guilds.cache.get(guildID), {
            context: guildID
        })

        return this.resolveEval(fetch)
    }

    /**
     * Finds the guild member on the whole client.
     *
     * @param guildID
     * @param memberID
     */
    async fetchMember(guildID: Snowflake, memberID: Snowflake): Promise<GuildMember>{
        const fetch = await this.shard.broadcastEval((client, ctx) => {
            const guild = client.guilds.cache.get(ctx.guildID)
            if(guild){
                return guild.members.fetch(ctx.memberID).then(user => user).catch(() => {
                    return undefined
                })
            }

            return undefined
        }, {
            context: {
                guildID,
                memberID
            }
        })

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
            .filter(channel => channel.type === ChannelType.GuildText && channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages))
            .sort((a: TextChannel, b: TextChannel) => a.position > b.position ? 1 : -1)
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
            if(channel && channel.type == ChannelType.GuildText && channel.viewable) return channel
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
                    .fetch({ message: messageID, cache: false, force: true })
                    .catch(() => resolve(undefined))
                    .then((message: Message<true>) => resolve(message))
            })
        }

        return undefined
    }

    buildErrorReporterEmbed(lang: string, guild: Guild, err: DiscordAPIError | HTTPError): EmbedBuilder{
        return new EmbedBuilder()
            .setAuthor({
                iconURL: this.user.avatarURL(),
                name: `${this.user.username} | ${LanguageManager.translate(lang, 'errors.reporter.title')}`,
            })
            .setColor(Colors.DarkRed)
            .setFooter({
                text: guild.name,
                iconURL: guild.iconURL()
            })
            .setTimestamp()
            .setDescription(LanguageManager.translate(lang, "errors.reporter.description", ...[
                err.name,
                err.message,
                err.method,
                err.url,
                err.status,
                err.stack
            ]))
    }

}
