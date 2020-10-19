import { Channel, Guild, PermissionString } from 'discord.js';
import { Bot } from '../Constants';

interface PermissionState{
    has: Boolean
    missing: PermissionString[]
    toString(): string
}

export default class PermissionController{

    public checkSelfPermissions(guild: Guild, channel: Channel): PermissionState{
        const missingPermissions = this.getMissingPermissions(guild, channel)

        return {
            has: missingPermissions.length === 0,
            missing: missingPermissions,
            toString(){
                let i = 1;
                return missingPermissions.map(permission => {
                    return `**${i++}.** ${PermissionController.humanizePermission(permission)}`
                }).join('\n')
            }
        }
    }

    public getMissingPermissions(guild: Guild, channel: Channel): PermissionString[]{
        return guild.me.permissionsIn(channel).missing(Bot.REQUIRED_PERMISSIONS)
    }

    public static humanizePermission(permission: PermissionString): string{
        switch(permission){
            case 'SEND_MESSAGES':
                return 'Mesaj Gönder'

            case 'ADD_REACTIONS':
                return 'Tepki Ekle'

            case 'VIEW_CHANNEL':
                return 'Kanalı Görüntüle'

            case 'EMBED_LINKS':
                return 'Bağlantı Yerleştir'

            case 'READ_MESSAGE_HISTORY':
                return 'Mesaj Geçmişini Oku'

            case 'USE_EXTERNAL_EMOJIS':
                return 'Harici Emojiler Kullan'

            default:
                return 'Unsupported permission'
        }
    }

}
