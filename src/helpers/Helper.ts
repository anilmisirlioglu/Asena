import Factory from '../Factory';
import { RaffleHelper } from './RaffleHelper';
import { SurveyHelper } from './SurveyHelper';

export interface IHelper{
    readonly raffle: RaffleHelper
    readonly survey: SurveyHelper
}

export default abstract class Helper extends Factory{}