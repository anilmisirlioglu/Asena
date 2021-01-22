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
            missing: missingPermissions
        }
    }

    public getMissingPermissions(guild: Guild, channel: Channel): PermissionString[]{
        return guild.me.permissionsIn(channel).missing(Bot.REQUIRED_PERMISSIONS)
    }

    public static humanizePermission(permission: PermissionString): string{
        switch(permission){
            case 'SEND_MESSAGES':
                return 'send-message'

            case 'ADD_REACTIONS':
                return 'add-reactions'

            case 'VIEW_CHANNEL':
                return 'view-channels'

            case 'EMBED_LINKS':
                return 'embed-links'

            case 'READ_MESSAGE_HISTORY':
                return 'read-message-history'

            case 'USE_EXTERNAL_EMOJIS':
                return 'use-external-emojis'

            default:
                return 'unsupported'
        }
    }

}
