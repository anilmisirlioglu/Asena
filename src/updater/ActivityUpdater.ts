import { Emojis, Bot } from '../Constants'
import SuperClient from '../SuperClient';
import Factory from '../Factory';
import ServerStatsPacket from '../protocol/ServerStatsPacket';

export default class ActivityUpdater extends Factory{

    private counter: number = 0 // planned for later use elsewhere

    public start(): void{
        this.client.on('ready', async () => {
            const client: SuperClient = this.client

            client.logger.info(`${client.user.username} ${client.version.getFullVersion()} başlatılıyor...`)

            this.counter = client.guilds.cache.size

            await client.user.setStatus('online')

            client.logger.info(`${client.user.username} aktif, toplam ${this.counter} sunucuya hizmet veriliyor!`)
        })

        this.setGuildCounterListeners()
    }

    async updateActivity(packet: ServerStatsPacket){
        await this.client.user.setActivity(`${Emojis.CONFETTI_REACTION_EMOJI} ${packet.serverCount} servers | ${process.env.DEFAULT_PREFIX}help - ${Bot.WEBSITE.slice(8, Bot.WEBSITE.length)}`, {
            type: 'PLAYING'
        })
    }

    private setGuildCounterListeners(): void{
        const webhook = this.client.webhook
        this.client.on('guildCreate', async guild => {
            this.counter += 1

            await webhook.resolveGuild(guild)
        })

        this.client.on('guildDelete', async guild => {
            this.counter -= 1

            await webhook.resolveGuild(guild, false)
        })
    }

}
