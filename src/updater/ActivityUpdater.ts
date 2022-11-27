import { Emojis, prefix, URLMap } from '../Constants'
import SuperClient from '../SuperClient';
import Factory from '../Factory';
import ServerStatsPacket from '../protocol/ServerStatsPacket';
import { ActivityType } from 'discord-api-types/v10';

export default class ActivityUpdater extends Factory{

    private counter: number = 0 // planned for later use elsewhere

    public start(): void{
        this.client.on('ready', async () => {
            const client: SuperClient = this.client

            client.logger.info(`${client.user.username} ${client.version.getFullVersion()} launching...`)

            this.counter = client.guilds.cache.size

            client.user.setStatus('online')

            client.logger.info(`${client.user.username} is active, serving a total of ${this.counter} servers!`)
        })

        this.setGuildCounterListeners()
    }

    public setActivity(packet: ServerStatsPacket){
        this.client.user.setActivity(`${Emojis.CONFETTI_REACTION_EMOJI} ${packet.serverCount} servers | ${prefix}help - ${URLMap.WEBSITE.slice(8, URLMap.WEBSITE.length)}`, {
            type: ActivityType.Playing
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
