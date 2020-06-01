import { SuperClient } from '../helpers/Helper';
import { Constants } from '../Constants';

export class GuildHandler{

    private counter: number = 0
    private static readonly UPDATE_INTERVAL = 1000 * 60 * 10

    constructor(private readonly client: SuperClient){
        this.setGuildCounterListeners()

        this.setActivityUpdateInterval()
    }

    private setGuildCounterListeners(): void{
        this.client.on('ready', () => {
            this.counter = this.client.guilds.cache.size
        })

        this.client.on('guildCreate', () => {
            this.counter += 1
        })

        this.client.on('guildDelete', () => {
            this.counter -= 1
        })
    }

    private setActivityUpdateInterval(){
        setInterval(async () => {
            await this.client.user.setActivity(`${Constants.CONFETTI_REACTION_EMOJI} ${this.counter} Sunucu | ${process.env.PREFIX}help`, {
                type: 'PLAYING'
            });
        }, GuildHandler.UPDATE_INTERVAL)
    }

    public getCounter(): number{
        return this.counter
    }

}