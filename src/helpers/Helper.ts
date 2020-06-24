import Factory from '../Factory';
import { MessageHelper } from './MessageHelper';
import { ChannelHelper } from './ChannelHelper';
import { RaffleHelper } from './RaffleHelper';
import { SurveyHelper } from './SurveyHelper';

export interface IHelper{
    readonly message: MessageHelper
    readonly channel: ChannelHelper
    readonly raffle: RaffleHelper
    readonly survey: SurveyHelper
}

export default abstract class Helper extends Factory{}