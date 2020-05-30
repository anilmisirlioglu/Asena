import { Client, Message } from 'discord.js'

export abstract class Command{

    protected constructor(
        private readonly name: string,
        private readonly aliases: string[],
        private readonly description: string,
        private readonly usage: string | null,
        private readonly permission: string | undefined
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

    public getPermissions(): string | undefined{
        return this.permission
    }

    public async abstract run(client: Client, message: Message, args: string[]): Promise<boolean>
}


