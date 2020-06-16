import Factory from '../Factory';
import RaffleManager from './RaffleManager';

export interface IManager{
    readonly raffle: RaffleManager
}

export default abstract class Manager extends Factory{}