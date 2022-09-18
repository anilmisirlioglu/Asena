import ApplicationCommand from '../ApplicationCommand';

export default class Fix extends ApplicationCommand{

    build(){
        this.setName('fix')
        this.setDescription('Troubleshooting about an unending but a giveaway that should end')
        this.setDescriptionLocalizations({ tr: 'Bitmeyen ancak bitmesi gereken bir çekilişi bitirir' })
        this.addStringOption(option => option
            .setName('giveaway')
            .setNameLocalizations({ tr: 'çekiliş' })
            .setDescription('Giveaway message ID for specific giveaway')
            .setDescriptionLocalizations({ tr: 'Çekiliş mesaj ID' })
        )
    }

}