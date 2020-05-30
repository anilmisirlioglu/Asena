import cron from 'node-cron';
import { PubSub } from 'apollo-server-express';
import { Constants } from '../Constants';

export class RaffleHandler{

    constructor(
        private readonly Raffle,
        private readonly pubsub: PubSub
    ){}

    public startJobSchedule(): void{
        cron.schedule('* * * * *', () => {
            this.checkRaffles().then() // none
        })
    }

    private async checkRaffles(){
        const cursor = await this.Raffle
            .find({ status: 'CONTINUES' })
            .cursor()

        for(let raffle = await cursor.next(); raffle !== null; raffle = await cursor.next()){
            const finishAt = new Date(raffle.finishAt)
            if(Date.now() >= +finishAt){
                await raffle.updateOne({ status: 'FINISHED' })
                await this.pubsub.publish(Constants.SUBSCRIPTIONS.ON_RAFFLE_FINISHED, {
                    onRaffleFinished: raffle
                })
            }
        }
    }

}