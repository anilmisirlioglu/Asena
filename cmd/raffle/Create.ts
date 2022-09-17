import ApplicationCommand from '../ApplicationCommand';

export default class Create extends ApplicationCommand{

    build(){
        this.setName('create')
        this.setDescription('Starts a new cool giveaway 🎉')
        this.setDescriptionLocalizations({ tr: 'Yeni havalı bir çekiliş oluşturur 🎉' })
        this.addIntegerOption(option => option
            .setName('winners')
            .setNameLocalizations({ tr: 'kazanan-sayısı' })
            .setDescription('The number of winners')
            .setDescriptionLocalizations({ tr: 'Kazanan sayısı' })
            .setRequired(true)
        )
        this.addStringOption(option => option
            .setName('prize')
            .setNameLocalizations({ tr: 'ödül' })
            .setDescription('Giveaway prize (or title)')
            .setDescriptionLocalizations({ tr: 'Çekiliş ödülü (veya başlığı)' })
            .setRequired(true)
        )
        this.addStringOption(option => option
            .setName('time')
            .setNameLocalizations({ tr: 'süre' })
            .setDescription('Duration of giveaway (e.g: 1m, 2m2h3s, 5h, 1d)')
            .setDescriptionLocalizations({ tr: 'Çekilişin süresi (örnek: 1m, 2m2h3s, 5h, 1d)' })
            .setRequired(true)
        )
        this.addStringOption(option => option
            .setName('color')
            .setNameLocalizations({ tr: 'renk' })
            .setDescription('Giveaways embed color (e.g: RED, #EB4034)')
            .setDescriptionLocalizations({ tr: 'Çekiliş embed rengi (örnek: RED, #EB4034)' })
        )
        this.addStringOption(option => option
            .setName('servers')
            .setNameLocalizations({ tr: 'sunucular' })
            .setDescription('Invitations of the servers that the member must participate in order to participate in the giveaway')
            .setDescriptionLocalizations({ tr: 'Kullanıcının çekilişe katılabilmesi için içerisinde bulunması gereken sunucuların davet bağlantıları' })
        )
        this.addStringOption(option => option
            .setName('reward-roles')
            .setNameLocalizations({ tr: 'ödül-roller' })
            .setDescription('Reward roles of giveaway (e.g: @Role,Asena,712450379773771887)')
            .setDescriptionLocalizations({ tr: 'Çekilişte verilecek ödül roller (örnek: @Role,Asena,712450379773771887)'})
        )
        this.addStringOption(option => option
            .setName('allowed-roles')
            .setNameLocalizations({ tr: 'gerekli-roller' })
            .setDescription('The roles that the member must have in order to participate in the giveaway (e.g: @Role,Asena)')
            .setDescriptionLocalizations({ tr: 'Kullanıcının çekilişe katılabilmesi için sahip olması gereken roller listesi' })
        )
        this.addStringOption(option => option
            .setName('banner')
            .setNameLocalizations({ tr: 'afiş' })
            .setDescription('Giveaway banner URL')
            .setDescriptionLocalizations({ tr: 'Çekiliş afişi' })
        )
    }

}