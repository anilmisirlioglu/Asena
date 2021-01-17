import Constants from '../Constants'
import SuperClient from '../SuperClient';
import Factory from '../Factory';
import request from '../utils/Internet';
import ActivityUpdatePacket from '../protocol/ActivityUpdatePacket';

export default class ActivityUpdater extends Factory{

    private counter: number = 0 // planned for later use elsewhere
    private servers: number = 0
    private shards: number = 0

    public start(): void{
        this.client.on('ready', async () => {
            const client: SuperClient = this.client

            await client.user.setStatus('online')

            client.logger.info(`${client.user.username} ${client.version.getFullVersion()} başlatılıyor...`)
            client.logger.info(`${client.user.username} aktif, toplam ${client.guilds.cache.size} sunucuya hizmet veriliyor!`)
        })

        this.setGuildCounterListeners()
    }

    async updateActivity(packet: ActivityUpdatePacket){
        this.servers = packet.serverCount
        this.shards = packet.shardCount

        await this.client.user.setActivity(`${Constants.CONFETTI_REACTION_EMOJI} ${packet.serverCount} servers | ${process.env.DEFAULT_PREFIX}help - asena.xyz`, {
            type: 'PLAYING'
        })

        if(!this.client.isDevBuild){
            this.updateTopGGStats()
            this.updateDiscordBotsGGStats()
        }
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

    private updateTopGGStats(){
        request({
            host: Constants.TOP_GG_URL,
            path: `/api/bots/${this.client.user.id}/stats`,
            method: 'POST',
            headers: {
                Authorization: process.env.TOP_GG_API_KEY
            }
        }, {
            server_count: this.servers,
            shard_count: this.shards
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
            guildCount: this.servers,
            shardCount: this.shards
        })
    }

}
