import Factory from '../Factory';
import RaffleManager from './RaffleManager';
import ServerManager from './ServerManager';

export interface IManager{
    readonly raffle: RaffleManager
    readonly server: ServerManager
}

export default abstract class Manager extends Factory{}