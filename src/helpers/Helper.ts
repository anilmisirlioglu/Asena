import { Client, Collection } from 'discord.js'
import { Version } from '../utils/Version';
import { Logger } from '../utils/Logger';
import { MessageHelper } from './MessageHelper';
import { ChannelHelper } from './ChannelHelper';
import { RaffleHelper } from './RaffleHelper';

export type SuperClient = Client & IHelper

interface CustomHelper{
    message: MessageHelper<SuperClient>
    channel: ChannelHelper<SuperClient>
    raffle: RaffleHelper<SuperClient>
}

interface IHelper{
    version: Version
    logger: Logger
    commands: Collection<any, any>
    aliases: Collection<any, any>
    helpers: CustomHelper
}

export abstract class Helper<C extends SuperClient>{

    protected constructor(private client: C){}

    protected getClient(): C{
        return this.client
    }

}