import Factory from '../Factory';
import { CommandHandler } from './CommandHandler';
import { GuildHandler } from './GuildHandler';
import { RaffleHandler } from './RaffleHandler';
import { SurveyHandler } from './SurveyHandler';

export interface IHandler{
    readonly command: CommandHandler
    readonly guild: GuildHandler
    readonly raffle: RaffleHandler
    readonly survey: SurveyHandler
}

export default abstract class Handler extends Factory{}