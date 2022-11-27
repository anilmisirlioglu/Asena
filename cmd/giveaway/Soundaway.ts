import ApplicationCommand from '../ApplicationCommand';
import { ChannelType } from 'discord-api-types/v9';

export default class Soundaway extends ApplicationCommand{

    build(){
        this.setName('soundaway')
        this.setDescription('Starts quick giveaway between those found in the determined (or all) voice channel')
        this.setDescriptionLocalizations({ tr: 'Tüm ses kanallarında veya belirli bir ses kanalında bulunan üyeler arasında bir çekiliş başlatır' })
        this.addIntegerOption(option => option
            .setName('winners')
            .setNameLocalizations({ tr: 'kazanan-sayısı' })
            .setDescription('Kazanan sayısı')
            .setRequired(true)
        )
        this.addStringOption(option => option
            .setName('title')
            .setNameLocalizations({ tr: 'başlık' })
            .setDescription('Giveaway title')
            .setDescriptionLocalizations({ tr: 'Çekiliş başlığı' })
        )
        this.addUserOption(option => option
            .setName('user')
            .setNameLocalizations({ tr: 'üye' })
            .setDescription('If the user represents the giveaway is determined as the voice channel in which the user is located')
            .setDescriptionLocalizations({ tr: 'Eğer üye parametresi girilirse sadece o üyenin bulunduğu ses kanalında çekiliş yapılır' })
        )
        this.addChannelOption(option => option
            .setName('channel')
            .setNameLocalizations({ tr: 'ses-kanalı' })
            .setDescription('If the channel represents, the giveaway is determined as a voice channel')
            .setDescriptionLocalizations({ tr: 'Eğer ses kanalı parametresi girilirse o sadece ses kanalında çekiliş yapılır' })
            .addChannelTypes(ChannelType.GuildVoice)
        )
    }

}