import cron from 'node-cron';
import { Constants } from '../Constants';
import Raffle from '../models/Raffle';
import pubsub from '../utils/PubSub';

export class RaffleHandler{

    public startJobSchedule(): void{
        cron.schedule('* * * * *', () => {
            this.checkRaffles().then() // none
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
            const finishAt = new Date(raffle.finishAt)
            const remaining = +finishAt - Date.now()
            if(remaining <= 60 * 1000){
                await raffle.updateOne({ status: 'ALMOST_DONE' })
                this.setRaffleInterval(remaining - 2000, raffle)
            }else if(Date.now() >= +finishAt){
                await raffle.updateOne({ status: 'ALMOST_DONE' })
                this.setRaffleInterval(1000, raffle)
            }
        }
    }

    private setRaffleInterval(timeout: number, raffle: any): void{
        setTimeout(async () => {
            await raffle.updateOne({ status: 'FINISHED' })
            await pubsub.publish(Constants.SUBSCRIPTIONS.ON_RAFFLE_FINISHED, {
                onRaffleFinished: raffle
            })
        }, timeout)
    }
    
}