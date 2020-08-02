import SuperClient from './SuperClient';
import Constants from './Constants';

export default class Asena extends SuperClient{

    constructor(){
        super({
            prefix: process.env.PREFIX ?? '!a',
            isDevBuild: process.env.NODE_ENV !== 'production'
        })

        // Load all commands
        this.getCommandHandler().registerAllCommands()

        // Activity updater start
        this.getActivityUpdater().start()

        // Command run
        this.on('message', async message => {
            await this.getCommandHandler().run(message)
        })

        // Delete server data from db
        this.on('guildDelete', async guild => {
            await this.getServerManager().deleteServerData(guild.id)
            await guild.owner?.send([
                `> ${Constants.RUBY_EMOJI} Botun kullanımı ile ilgili sorunlar mı yaşıyorsun? Lütfen bizimle iletişime geçmekten çekinme.\n`,
                `:earth_americas: Website: https://asena.xyz`,
                ':sparkles: Destek Sunucusu: https://discord.gg/CRgXhfs'
            ].join('\n'))
        })

        this.getRaffleTimeUpdater().listenReactions()
        this.getTaskTiming().startTimings()
    }

}
