import ApplicationCommand from '../ApplicationCommand';

export default class Survey extends ApplicationCommand{

    build(){
        this.setName('survey')
        this.setDescription('Starts a new survey')
        this.setDescriptionLocalizations({ tr: 'Yeni bir anket başlatır' })
        this.addStringOption(option => option
            .setName('title')
            .setNameLocalizations({ tr: 'başlık' })
            .setDescription('Survey text (or title)')
            .setDescriptionLocalizations({ tr: 'Anket metni (veya başlığı)' })
            .setRequired(true)
        )
        this.addStringOption(option => option
            .setName('time')
            .setNameLocalizations({ tr: 'süre' })
            .setDescription('Duration of survey (e.g: 1h2m, 5h, 1d)')
            .setDescriptionLocalizations({ tr: 'Anketin süresi (örnek: 1h2m, 5h, 1d)' })
        )
    }

}