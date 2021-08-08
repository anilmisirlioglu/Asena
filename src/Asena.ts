import SuperClient from './SuperClient';
import { Emojis } from './Constants';
import { validateRaffleText } from './utils/Utils';

export default class Asena extends SuperClient{

    constructor(isDevBuild: boolean){
        super({
            prefix: process.env.DEFAULT_PREFIX ?? '!a',
            isDevBuild
        })

        // Load all languages
        this.getLanguageManager().init()

        // Load all commands
        this.getCommandHandler().registerAllCommands()

        // Activity updater start
        this.getActivityUpdater().start()

        // Start premium updater
        this.getPremiumUpdater().start()

        // Command run
        this.on('message', async message => {
            await this.getCommandHandler().run(message)
        })

        // Initialize app
        this.on('ready', () => {
            this.init()

            this.getRaffleTimeUpdater().listenReactions()
        })

        // if it's a raffle message, delete the lottery
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

        // Create server data from db
        this.on('guildCreate', async guild => {
            const server = await this.servers.create({
                server_id: guild.id
            } as any)

            const message = server.translate('events.guildCreate')
            const owner = await guild.fetchOwner()
            if(owner){
                owner.createDM()
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
                guild.fetchOwner().then(owner => {
                    owner?.createDM().then(channel => {
                        channel.send(`> ${Emojis.RUBY_EMOJI} ${server.translate('events.guildDelete')}`)
                    })
                })
            }catch(e){
                // Do not show this error on the console. Because we don't care.
            }
        })
    }

}
