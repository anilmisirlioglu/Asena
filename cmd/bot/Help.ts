import ApplicationCommand from '../ApplicationCommand';

export default class Help extends ApplicationCommand{

    build(){
        this.setName('help')
        this.setDescription('Responds with a list of commands you can use, and information about Asena')
        this.setDescriptionLocalizations({ tr: 'Komutlar hakkında bilgi almak için yardım menüsünü gönderir' })
        this.addStringOption(option =>
            option
                .setName('command')
                .setNameLocalizations({ tr: 'komut' })
                .setDescription('The sub command you want to see the help menu')
                .setDescriptionLocalizations({ tr: 'Detaylı yardım almak istediğiniz komut' })
        )
    }

}