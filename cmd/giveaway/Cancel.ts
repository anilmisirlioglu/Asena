import ApplicationCommand from '../ApplicationCommand';

export default class Cancel extends ApplicationCommand{

    build(){
        this.setName('cancel')
        this.setDescription('Cancels a continued giveaway')
        this.setDescriptionLocalizations({ tr: 'Devam eden bir çekilişi iptal eder' })
        this.addStringOption(option => option
            .setName('giveaway')
            .setNameLocalizations({ tr: 'çekiliş' })
            .setDescription('Giveaway message ID for specific giveaway')
            .setDescriptionLocalizations({ tr: 'Çekiliş mesaj ID' })
        )
    }

}