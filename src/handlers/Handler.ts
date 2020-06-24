import Factory from '../Factory';
import { GuildHandler } from './GuildHandler';
import { RaffleHandler } from './RaffleHandler';
import { SurveyHandler } from './SurveyHandler';
import CommandHandler from '../commands/CommandHandler';

export interface IHandler{
    readonly guild: GuildHandler
    readonly raffle: RaffleHandler
    readonly survey: SurveyHandler
    readonly command: CommandHandler
}

export default abstract class Handler extends Factory{}