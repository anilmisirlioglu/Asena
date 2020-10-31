import Constants from '../Constants'
import SuperClient from '../SuperClient';
import Factory from '../Factory';
import request from '../utils/Internet';

export default class ActivityUpdater extends Factory{

    private counter: number = 0

    public start(): void{
        this.client.on('ready', async () => {
            const client: SuperClient = this.client

            await client.user.setStatus('online')
            await client.user.setActivity(this.getActivityString(), {
                type: 'PLAYING'
            })

            client.logger.info(`Asena ${client.version.getFullVersion()} başlatılıyor...`)
            client.logger.info(`${client.user.username} aktif, toplam ${client.guilds.cache.size} sunucuya hizmet veriliyor!`)
        })

        this.setGuildCounterListeners()

        this.setActivityUpdateInterval()
    }

    private getActivityString(): string{
        return `${Constants.CONFETTI_REACTION_EMOJI} ${this.counter} Sunucu | ${process.env.DEFAULT_PREFIX}help\nhttps://asena.xyz`
    }

    private setGuildCounterListeners(): void{
        const webhook = this.client.webhook
        this.client.on('ready', () => {
            this.counter = this.client.guilds.cache.size
        })

        this.client.on('guildCreate', guild => {
            this.counter += 1

            webhook.resolveGuild(guild)
        })

        this.client.on('guildDelete', guild => {
            this.counter -= 1

            webhook.resolveGuild(guild, false)
        })
    }

    private setActivityUpdateInterval(){
        setInterval(async () => {
            await this.client.user.setActivity(this.getActivityString(), {
                type: 'PLAYING'
            })

            if(!this.client.isDevBuild){
                this.updateTopGGStats()
                this.updateDiscordBotsGGStats()
            }
        }, Constants.UPDATE_INTERVAL)
    }

    private updateTopGGStats(){
        request({
            host: Constants.TOP_GG_URL,
            path: `/api/bots/${this.client.user.id}/stats`,
            method: 'POST',
            headers: {
                Authorization: process.env.TOP_GG_API_KEY
            }
        }, {
            server_count: this.counter
        })
    }

    private updateDiscordBotsGGStats(){
        request({
            host: Constants.DISCORD_BOTS_GG_URL,
            path: `/api/v1/bots/${this.client.user.id}/stats`,
            method: 'POST',
            headers: {
                Authorization: process.env.DISCORD_BOTS_GG_API_KEY
            }
        }, {
            guildCount: this.counter
        })
    }

    public getCounter(): number{
        return this.counter
    }

}
