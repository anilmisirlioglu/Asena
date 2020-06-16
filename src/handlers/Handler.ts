import Factory from '../Factory';
import { CommandHandler } from './CommandHandler';
import { GuildHandler } from './GuildHandler';
import { RaffleHandler } from './RaffleHandler';

export interface IHandler{
    readonly command: CommandHandler
    readonly guild: GuildHandler
    readonly raffle: RaffleHandler
}

export default abstract class Handler extends Factory{}