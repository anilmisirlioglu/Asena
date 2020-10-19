import { Emojis, TOP_GG_URL, DISCORD_BOTS_GG_URL, Bot } from '../Constants'
import SuperClient from '../SuperClient';
import Factory from '../Factory';
import request from '../utils/Internet';

export default class ActivityUpdater extends Factory{

    private counter: number = 0

    public start(): void{
        this.client.on('ready', async () => {
            const client: SuperClient = this.client
            client.logger.info(`Asena ${client.version.getFullVersion()} başlatılıyor...`)

            this.counter = client.guilds.cache.size

            await Promise.all([
                client.user.setStatus('online'),
                client.user.setActivity(this.getActivityString(), {
                    type: 'PLAYING'
                })
            ])

            client.logger.info(`${client.user.username} aktif, toplam ${this.counter} sunucuya hizmet veriliyor!`)
        })

        this.setGuildCounterListeners()
    }

    private getActivityString(): string{
        return `${Emojis.CONFETTI_REACTION_EMOJI} ${this.counter} Sunucu | ${process.env.PREFIX}help\n${Bot.WEBSITE}`
    }

    private setGuildCounterListeners(): void{
        this.client.on('guildCreate', async guild => {
            this.counter += 1

            await Promise.all([
                this.client.webhook.resolveGuild(guild),
                this.updateStatus()
            ])
        })

        this.client.on('guildDelete', async guild => {
            this.counter -= 1

            await Promise.all([
                this.client.webhook.resolveGuild(guild, false),
                this.updateStatus()
            ])
        })
    }

    private async updateStatus(){
        await this.client.user.setActivity(this.getActivityString(), {
            type: 'PLAYING'
        })

        if(!this.client.isDevBuild){
            this.updateTopGGStats()
            this.updateDiscordBotsGGStats()
        }
    }

    private updateTopGGStats(){
        request({
            host: TOP_GG_URL,
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
            host: DISCORD_BOTS_GG_URL,
            path: `/api/v1/bots/${this.client.user.id}/stats`,
            method: 'POST',
            headers: {
                Authorization: process.env.DISCORD_BOTS_GG_API_KEY
            }
        }, {
            guildCount: this.counter
        })
    }

}
