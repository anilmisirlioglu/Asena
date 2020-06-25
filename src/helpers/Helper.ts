import Factory from '../Factory';
import { MessageHelper } from './MessageHelper';
import { RaffleHelper } from './RaffleHelper';
import { SurveyHelper } from './SurveyHelper';

export interface IHelper{
    readonly message: MessageHelper
    readonly raffle: RaffleHelper
    readonly survey: SurveyHelper
}

export default abstract class Helper extends Factory{}