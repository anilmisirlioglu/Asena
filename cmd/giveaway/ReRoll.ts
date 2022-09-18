import ApplicationCommand from '../ApplicationCommand';

export default class ReRoll extends ApplicationCommand{

    build(){
        this.setName('reroll')
        this.setDescription('Re-pull the winners')
        this.setDescriptionLocalizations({ tr: 'Çekiliş kazananlarını yeniden belirler' })
        this.addStringOption(option => option
            .setName('giveaway')
            .setNameLocalizations({ tr: 'çekiliş' })
            .setDescription('Giveaway message ID for specific giveaway')
            .setDescriptionLocalizations({ tr: 'Çekiliş mesaj ID' })
        )
        this.addIntegerOption(option => option
            .setName('winners')
            .setNameLocalizations({ tr: 'kazanan-sayısı' })
            .setDescription('Number of winners to be re-pulled (if is not presented, re-pulls all winners)')
            .setDescriptionLocalizations({ tr: 'Yeniden çekilecek kazanan sayısı (eğer değer girilmez ise hepsi yeniden çekilir)' })
        )
    }

}