import SuperClient from './SuperClient';
import Constants from './Constants';
import { validateRaffleText } from './utils/Utils';

export default class Asena extends SuperClient{

    constructor(isDevBuild: boolean){
        super({
            prefix: process.env.DEFAULT_PREFIX ?? '!a',
            isDevBuild
        })

        // Load all languages
        this.getLanguageManager().run()

        // Load all commands
        this.getCommandHandler().registerAllCommands()

        // Activity updater start
        this.getActivityUpdater().start()

        // Command run
        this.on('message', async message => {
            await this.getCommandHandler().run(message)
        })

        // Initialize static values
        this.on('ready', () => {
            this.init()
        })

        // if it's a raffle message, delete the giveaway
        const emojiLength = Constants.CONFETTI_EMOJI.length
        this.on('messageDelete', async message => {
            if(message.author?.id === this.user.id){
                if(message.content && validateRaffleText(message.content)){
                    const server = await this.servers.get(message.guild?.id)
                    const raffle = await server.raffles.get(message.id)
                    if(raffle && raffle.isContinues()){
                        await raffle.delete()
                    }
                }
            }
        })

        // Create server data on db and send hello message
        this.on('guildCreate', async guild => {
            const server = await this.servers.create({
                server_id: guild.id
            } as any)

            const message = server.translate('events.guildCreate')
            if(guild.owner){
                guild.owner.createDM()
                    .then(channel => channel
                        .send(message)
                        .catch(() => this.textChannelElection(guild)?.send(message)))
                    .catch(() => this.textChannelElection(guild)?.send(message))
            }else{
                this.textChannelElection(guild)?.send(message)
            }
        })

        // Delete server data from db
        this.on('guildDelete', async guild => {
            const server = await this.servers.get(guild.id)
            await server.delete()

            try{
                guild.owner?.createDM().then(channel => {
                    channel.send(`> ${Constants.RUBY_EMOJI} ${server.translate('events.guildDelete')}`)
                })
            }catch(e){
                // Do not show this error on the console. Because we don't care.
            }
        })

        this.getRaffleTimeUpdater().listenReactions()
    }

}
