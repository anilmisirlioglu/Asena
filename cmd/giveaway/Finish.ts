import ApplicationCommand from '../ApplicationCommand';

export default class Finish extends ApplicationCommand{

    build(){
        this.setName('finish')
        this.setDescription('Finishes a continued giveaway early')
        this.setDescriptionLocalizations({ tr: 'Devam eden bir çekilişi hemen bitirir' })
        this.addStringOption(option => option
            .setName('giveaway')
            .setNameLocalizations({ tr: 'çekiliş' })
            .setDescription('Giveaway message ID for specific giveaway')
            .setDescriptionLocalizations({ tr: 'Çekiliş mesaj ID' })
        )
    }

}