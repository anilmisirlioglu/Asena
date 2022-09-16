import { Guild, PermissionResolvable, PermissionsBitField, TextChannel } from 'discord.js';
import { Bot } from '../Constants';

interface PermissionState{
    has: Boolean
    missing: PermissionResolvable[]
    toString(): string
}

export default class PermissionController{

    public checkSelfPermissions(guild: Guild, channel: TextChannel): PermissionState{
        const missingPermissions = this.getMissingPermissions(guild, channel)

        return {
            has: missingPermissions.length === 0,
            missing: missingPermissions
        }
    }

    public getMissingPermissions(guild: Guild, channel: TextChannel): PermissionResolvable[]{
        return guild.members.me.permissionsIn(channel).missing(Bot.REQUIRED_PERMISSIONS)
    }

    public static humanizePermission(permission: PermissionResolvable): string{
        switch(permission){
            case PermissionsBitField.Flags.SendMessages:
                return 'send-message'

            case PermissionsBitField.Flags.AddReactions:
                return 'add-reactions'

            case PermissionsBitField.Flags.ViewChannel:
                return 'view-channels'

            case PermissionsBitField.Flags.EmbedLinks:
                return 'embed-links'

            case PermissionsBitField.Flags.ReadMessageHistory:
                return 'read-message-history'

            case PermissionsBitField.Flags.UseExternalEmojis:
                return 'use-external-emojis'

            default:
                return 'unsupported'
        }
    }

}
