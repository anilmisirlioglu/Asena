import { CommandInteraction, GuildMember, MessageEmbed, PermissionString } from 'discord.js'
import SuperClient from '../SuperClient';
import Server from '../structures/Server';
import ArgValidatorKit from './ArgValidatorKit';

interface CommandOptions{
    readonly name: string
    readonly group: Group
    readonly description: string,
    readonly permission: PermissionString | undefined,
    readonly examples: string[]
}

export enum Group{
    GIVEAWAY = 'raffle',
    POLL = 'survey',
    SERVER = 'server',
    BOT = 'bot'
}

/**
 * @param error must be one of the keys of a language strings
 * @param args translation args
 */
export interface Result{
    error?: string
    args?: Array<string | number>
}

export default abstract class Command extends ArgValidatorKit{

    readonly name: string
    readonly group: Group
    readonly description: string
    readonly permission: PermissionString | undefined
    readonly examples: string[]

    protected constructor(opts: CommandOptions){
        super()

        this.name = opts.name
        this.group = opts.group
        this.description = opts.description
        this.permission = opts.permission
        this.examples = opts.examples ?? []
    }

    public hasPermission(member: GuildMember): boolean{
        if(this.permission){
            return member.permissions.has(this.permission)
        }

        return true
    }

    public abstract run(client: SuperClient, server: Server, action: CommandInteraction): Promise<Result>

    error(error: string, ...args: Array<string | number>): Result{
        return { error, args  }
    }

    public getErrorEmbed(error: string): MessageEmbed{
        return new MessageEmbed()
            .setDescription('<:error:812708631035248670> ' + error)
            .setColor('RED')
    }

}
