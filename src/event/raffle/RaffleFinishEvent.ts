import Event from '../Event';
import { IRaffle } from '../../models/Raffle';

export default class RaffleFinishEvent extends Event{

    protected readonly raffle: IRaffle

    constructor(raffle: IRaffle){
        super('RAFFLE_FINISH')

        this.raffle = raffle
    }

    public getRaffle(): IRaffle{
        return this.raffle
    }

}