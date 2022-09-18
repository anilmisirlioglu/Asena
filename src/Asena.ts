import SuperClient from './SuperClient';
import { Emojis } from './Constants';
import { validateGiveawayText } from './utils/Utils';

export default class Asena extends SuperClient{

    constructor(isDevBuild: boolean){
        super({ isDevBuild })

        // Load all languages
        this.getLanguageManager().init()

        // Load all commands
        this.getCommandHandler().registerAllCommands()

        // Activity updater start
        this.getActivityUpdater().start()

        // Start premium updater - Disable for nor
        // this.getPremiumUpdater().start()

        // Initialize app
        this.on('ready', () => {
            this.init()

            this.getGiveawayTimeUpdater().listenReactions()
        })

        // if it's a giveaway message, delete the lottery
        this.on('messageDelete', async message => {
            if(message.author?.id === this.user.id){
                const server = await this.servers.get(message.guild?.id)
                if(server && message.content && validateGiveawayText(server, message.content)){
                    const giveaway = await server.giveaways.get(message.id)
                    if(giveaway && giveaway.isContinues()){
                        await giveaway.delete()
                    }
                }
            }
        })

        // Create server data from db
        this.on('guildCreate', async guild => {
            const server = await this.servers.create({ server_id: guild.id })

            const message = server.translate('events.guildCreate')
            const owner = await guild.fetchOwner()
            if(owner){
                owner.createDM()
                    .then(channel => channel
                        .send(message)
                        .catch(() => this.textChannelElection(guild)?.send(message)))
                    .catch(() => this.textChannelElection(guild)?.send(message))
            }else{
                await this.textChannelElection(guild)?.send(message)
            }
        })

        // Delete server data from db
        this.on('guildDelete', guild => {
            this.servers.get(guild.id).then(async server => {
                if(server){
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
                }
            })
        })

        this.on('interactionCreate', interaction => {
            this.getInteractionHandler().execute(interaction)
        })
    }

}
