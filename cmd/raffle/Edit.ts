import ApplicationCommand from '../ApplicationCommand';

export default class Edit extends ApplicationCommand{

    build(){
        this.setName('edit')
        this.setDescription('Changes the giveaway options (Premium)')
        this.setDescriptionLocalizations({ tr: 'Çekiliş ayarlarını değiştirir (Premium)' })
        this.addStringOption(option => option
            .setName('option')
            .setNameLocalizations({ tr: 'ayar' })
            .setDescription('Giveaway option for editing')
            .setDescriptionLocalizations({ tr: 'Düzenlenmek istenen ayar - özellik' })
            .setRequired(true)
            .setChoices(
                {
                    name: 'color',
                    value: 'color',
                    name_localizations: {
                        tr: 'renk'
                    }
                },
                {
                    name: 'prize',
                    value: 'prize',
                    name_localizations: {
                        tr: 'ödül'
                    }
                },
                {
                    name: 'time',
                    value: 'time',
                    name_localizations: {
                        tr: 'süre'
                    }
                },
                {
                    name: 'winners',
                    value: 'winners',
                    name_localizations: {
                        tr: 'kazanan-sayısı'
                    }
                },
                {
                    name: 'reward-roles',
                    value: 'reward-roles',
                    name_localizations: {
                        tr: 'ödül-roller'
                    }
                },
                {
                    name: 'banner',
                    value: 'banner',
                    name_localizations: {
                        tr: 'afiş'
                    }
                }
            ))
        this.addStringOption(option => option
            .setName('value')
            .setNameLocalizations({ tr: 'değer' })
            .setDescription('Selected options new value')
            .setDescriptionLocalizations({ tr: 'Seçilen ayarın yeni değeri' })
            .setRequired(true)
        )
        this.addStringOption(option => option
            .setName('giveaway')
            .setNameLocalizations({ tr: 'çekiliş' })
            .setDescription('Giveaway message ID for specific giveaway')
            .setDescriptionLocalizations({ tr: 'Çekiliş mesaj ID' })
        )
        this.addStringOption(option => option
            .setName('operator')
            .setNameLocalizations({ tr: 'operatör' })
            .setDescription('This option will only be used for time and reward-options')
            .setDescriptionLocalizations({ tr: 'Bu seçenek sadece süre ve ödül rolleri düzenlerken ekleme ve çıkarma için kullanılır' })
            .setChoices(
                { name: '+', value: '+' },
                { name: '-', value: '-' }
        ))
    }

}