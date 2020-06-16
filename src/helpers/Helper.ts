import Factory from '../Factory';
import { MessageHelper } from './MessageHelper';
import { ChannelHelper } from './ChannelHelper';
import { RaffleHelper } from './RaffleHelper';

export interface IHelper{
    readonly message: MessageHelper
    readonly channel: ChannelHelper
    readonly raffle: RaffleHelper
}

export default abstract class Helper extends Factory{}