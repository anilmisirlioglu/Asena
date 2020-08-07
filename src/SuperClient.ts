import {
    Client,
    Collection,
    Guild,
    GuildChannel,
    Message,
    Snowflake,
    TextChannel
} from "discord.js";
import Version from './utils/Version';
import Logger from './utils/Logger';
import TaskTiming from './tasks/TaskTiming';
import CommandHandler from './commands/CommandHandler';
import ActivityUpdater from './updater/ActivityUpdater';
import RaffleTimeUpdater from './updater/RaffleTimeUpdater';
import PermissionController from './controllers/PermissionController';
import SurveyHelper from './helpers/SurveyHelper';
import ServerManager from './managers/ServerManager';
import SetupManager from './setup/SetupManager';
import SyntaxWebHook from './SyntaxWebhook';

interface SuperClientBuilderOptions{
    prefix: string
    isDevBuild: boolean
}

export default abstract class SuperClient extends Client{

    readonly prefix: string = this.opts.prefix
    readonly isDevBuild: boolean = this.opts.isDevBuild

    readonly version: Version = new Version(process.env.npm_package_version || '1.0.0', this.opts.isDevBuild)

    readonly logger: Logger = new Logger()

    readonly setups: Collection<string, string> = new Collection<string, string>()

    private readonly taskTiming: TaskTiming = new TaskTiming()

    private readonly commandHandler: CommandHandler = new CommandHandler(this)

    private readonly activityUpdater: ActivityUpdater = new ActivityUpdater(this)
    private readonly raffleTimeUpdater: RaffleTimeUpdater = new RaffleTimeUpdater(this)

    private readonly permissionController: PermissionController = new PermissionController()

    private readonly surveyHelper: SurveyHelper = new SurveyHelper(this)

    readonly servers: ServerManager = new ServerManager()
    private readonly setupManager: SetupManager = new SetupManager()

    readonly webHook: SyntaxWebHook = new SyntaxWebHook()

    private static self: SuperClient

    protected constructor(private opts: SuperClientBuilderOptions){
        super({
            partials: ['CHANNEL', 'MESSAGE', 'REACTION'],
            fetchAllMembers: true
        })

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

    public getPermissionController(): PermissionController{
        return this.permissionController
    }

    public getSetupManager(): SetupManager{
        return this.setupManager
    }

    public getSurveyHelper(): SurveyHelper{
        return this.surveyHelper
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
