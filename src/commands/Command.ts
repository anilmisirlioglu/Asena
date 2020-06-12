import { GuildMember, Message, PermissionString } from 'discord.js'
import { SuperClient } from '../Asena';

export abstract class Command{

    protected constructor(
        private readonly name: string,
        private readonly aliases: string[],
        private readonly description: string,
        private readonly usage: string | null,
        private readonly permission: PermissionString | undefined
    ){}

    public getName(): string{
        return this.name
    }

    public getAliases(): string[]{
        return this.aliases
    }

    public getDescription(): string{
        return this.description
    }

    public getUsage(): string | null{
        return this.usage
    }

    public getPermission(): string | undefined{
        return this.permission
    }

    public hasPermission(member: GuildMember): boolean{
        if(this.permission){
            return member.hasPermission(this.permission)
        }

        return true
    }

    public async abstract run(client: SuperClient, message: Message, args: string[]): Promise<boolean>
}


