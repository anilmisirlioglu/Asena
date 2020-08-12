import Constants from '../Constants'
import SuperClient from '../SuperClient';
import Factory from '../Factory';

export default class ActivityUpdater extends Factory{

    private counter: number = 0

    private static readonly UPDATE_INTERVAL: number = 1000 * 60 * 5

    public start(): void{
        this.client.on('ready', async () => {
            const client: SuperClient = this.client

            await client.user.setStatus('online')
            await client.user.setActivity(this.getActivityName(), {
                type: 'PLAYING'
            })

            client.logger.info(`Asena ${client.version.getFullVersion()} başlatılıyor...`)
            client.logger.info(`${client.user.username} aktif, toplam ${client.guilds.cache.size} sunucuya hizmet veriliyor!`)
        })

        this.setGuildCounterListeners()

        this.setActivityUpdateInterval()
    }

    private getActivityName(): string{
        return `${Constants.CONFETTI_REACTION_EMOJI} ${this.counter} Sunucu | ${process.env.PREFIX}help\nhttps://asena.xyz`
    }

    private setGuildCounterListeners(): void{
        const webHook = this.client.webHook
        this.client.on('ready', () => {
            this.counter = this.client.guilds.cache.size
        })

        this.client.on('guildCreate', guild => {
            this.counter += 1

            webHook.resolveGuild(guild)
        })

        this.client.on('guildDelete', guild => {
            this.counter -= 1

            webHook.resolveGuild(guild, false)
        })
    }

    private setActivityUpdateInterval(){
        setInterval(async () => {
            await this.client.user.setActivity(this.getActivityName(), {
                type: 'PLAYING'
            })
        }, ActivityUpdater.UPDATE_INTERVAL)
    }

    public getCounter(): number{
        return this.counter
    }

}
