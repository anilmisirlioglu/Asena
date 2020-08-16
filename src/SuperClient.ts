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
import CommandHandler from './commands/CommandHandler';
import ActivityUpdater from './updater/ActivityUpdater';
import RaffleTimeUpdater from './updater/RaffleTimeUpdater';
import ServerManager from './managers/ServerManager';
import SetupManager from './setup/SetupManager';
import SyntaxWebhook from './SyntaxWebhook';

interface SuperClientBuilderOptions{
    prefix: string
    isDevBuild: boolean
}

export default abstract class SuperClient extends Client{

    readonly prefix: string = this.opts.prefix
    readonly isDevBuild: boolean = this.opts.isDevBuild

    readonly version: Version = new Version(process.env.npm_package_version || '1.0.0', this.opts.isDevBuild)

    readonly logger: Logger = new Logger()

    private readonly taskTiming: TaskTiming = new TaskTiming()

    private readonly commandHandler: CommandHandler = new CommandHandler(this)

    private readonly activityUpdater: ActivityUpdater = new ActivityUpdater(this)
    private readonly raffleTimeUpdater: RaffleTimeUpdater = new RaffleTimeUpdater(this)

    readonly servers: ServerManager = new ServerManager()
    private readonly setupManager: SetupManager = new SetupManager()

    readonly webhook: SyntaxWebhook = new SyntaxWebhook()

    static NAME: string
    static AVATAR: string

    private static self: SuperClient

    protected constructor(private opts: SuperClientBuilderOptions){
        super({
            partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
            fetchAllMembers: true
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

    public getCommandHandler(): CommandHandler{
        return this.commandHandler
    }

    public getSetupManager(): SetupManager{
        return this.setupManager
    }

    fetchChannel<T extends Snowflake>(guildId: T, channelId: T): GuildChannel | undefined{
        const guild: Guild = this.guilds.cache.get(guildId)
        if(guild){
            return guild.channels.cache.get(channelId)
        }

        return undefined
    }

    fetchMessage<T extends Snowflake>(guildId: T, channelId: T, messageId: T): Promise<Message | undefined>{
        const guild: Guild = this.guilds.cache.get(guildId)
        if(guild){
            const channel: GuildChannel = guild.channels.cache.get(channelId)
            if(channel instanceof TextChannel){
                return channel.messages.fetch(messageId)
            }
        }

        return undefined
    }

    buildErrorReporterEmbed(guild: Guild, err: DiscordAPIError | HTTPError): MessageEmbed{
        return new MessageEmbed()
            .setAuthor(`${this.user.username} | Hata Raporlayıcı`, this.user.avatarURL())
            .setColor('DARK_RED')
            .setFooter(guild.name, guild.iconURL())
            .setTimestamp()
            .setDescription([
                `**Hata:** ${err.name}`,
                `**Hata Mesajı:** ${err.message}`,
                `**Yöntem:** ${err.method}`,
                `**Veri Yolu:** ${err.path}`,
                `**Hata Kodu:** ${err.code}`,
                `**Stack Trace:**\`\`\`${err.stack}\`\`\``
            ].join('\n'))
    }

}
