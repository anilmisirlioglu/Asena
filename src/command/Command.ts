import { GuildMember, Message, MessageEmbed, PermissionString } from 'discord.js'
import SuperClient from '../SuperClient';
import Server from '../structures/Server';
import ArgValidatorKit from './ArgValidatorKit';

interface CommandOptions{
    readonly name: string
    readonly group: Group
    readonly aliases: string[],
    readonly description: string,
    readonly usage: string | null,
    readonly permission: PermissionString | undefined,
    readonly examples: string[]
}

export enum Group{
    GIVEAWAY = 'raffle',
    POLL = 'survey',
    SERVER = 'server',
    BOT = 'bot'
}

export default abstract class Command extends ArgValidatorKit{

    readonly name: string
    readonly group: Group
    readonly aliases: string[]
    readonly description: string
    readonly usage: string | null
    readonly permission: PermissionString | undefined
    readonly examples: string[]

    protected constructor(opts: CommandOptions){
        super()

        this.name = opts.name
        this.group = opts.group
        this.aliases = opts.aliases ?? []
        this.description = opts.description
        this.usage = opts.usage
        this.permission = opts.permission
        this.examples = opts.examples ?? []
    }

    public hasPermission(member: GuildMember): boolean{
        if(this.permission){
            return member.permissions.has(this.permission)
        }

        return true
    }

    public abstract run(client: SuperClient, server: Server, message: Message, args: string[]): Promise<boolean>

    public getErrorEmbed(error: string): MessageEmbed{
        return new MessageEmbed()
            .setDescription('<:error:812708631035248670> ' + error)
            .setColor('RED')
    }

}
