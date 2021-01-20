import Constants from '../Constants'
import SuperClient from '../SuperClient';
import Factory from '../Factory';
import ServerStatsPacket from '../protocol/ServerStatsPacket';

export default class ActivityUpdater extends Factory{

    private counter: number = 0 // planned for later use elsewhere

    public start(): void{
        this.client.on('ready', async () => {
            const client: SuperClient = this.client

            await client.user.setStatus('online')

            client.logger.info(`${client.user.username} ${client.version.getFullVersion()} başlatılıyor...`)
            client.logger.info(`${client.user.username} aktif, toplam ${client.guilds.cache.size} sunucuya hizmet veriliyor!`)
        })

        this.setGuildCounterListeners()
    }

    async updateActivity(packet: ServerStatsPacket){
        await this.client.user.setActivity(`${Constants.CONFETTI_REACTION_EMOJI} ${packet.serverCount} servers | ${process.env.DEFAULT_PREFIX}help - asena.xyz`, {
            type: 'PLAYING'
        })
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

}
