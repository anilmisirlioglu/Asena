import cron from 'node-cron';
import { Constants } from '../Constants';
import Raffle, { IRaffle } from '../models/Raffle';
import pubsub from '../utils/PubSub';
import { RaffleHelper } from '../helpers/RaffleHelper';
import { SuperClient } from '../Asena';

export class RaffleHandler<C extends SuperClient> extends RaffleHelper<C>{

    public startJobSchedule(): void{
        cron.schedule('* * * * *', async () => {
            await this.checkRaffles()
        })
    }

    private async checkRaffles(){
        const cursor = await Raffle
            .find({
                $or: [
                    { status: 'CONTINUES' },
                    { status: 'ALMOST_DONE' }
                ]
            })
            .cursor()

        for(let raffle = await cursor.next(); raffle !== null; raffle = await cursor.next()){
            const finishAt: Date = new Date(raffle.finishAt)
            const remaining: number = +finishAt - Date.now()
            if(remaining <= 60 * 1000){
                await raffle.updateOne({ status: 'ALMOST_DONE' })
                this.setRaffleInterval(remaining - 2000, raffle)
            }else if(Date.now() >= +finishAt){
                await raffle.updateOne({ status: 'ALMOST_DONE' })
                this.setRaffleInterval(1000, raffle)
            }
        }
    }

    private setRaffleInterval(timeout: number, raffle: IRaffle): void{
        setTimeout(async () => {
            await raffle.updateOne({
                status: 'FINISHED'
            })
            await this.client.handlers.raffle.finishRaffle(raffle)

            // No function for now
            await pubsub.publish(Constants.SUBSCRIPTIONS.ON_RAFFLE_FINISHED, {
                onRaffleFinished: raffle
            })
        }, timeout)
    }
    
}