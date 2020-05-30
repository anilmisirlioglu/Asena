import { Client } from 'discord.js'

export abstract class Helper<C extends Client>{

    protected constructor(private client: C){}

    protected getClient(): C{
        return this.client
    }

}