import cron from 'node-cron';
import Raffle, { IRaffle } from '../models/Raffle';
import Task from './Task';
import { Document } from 'mongoose';

export default class RaffleTask extends Task{

    public startScheduleTask(): void{
        cron.schedule('* * * * *', async () => {
            await this.check()
        })
    }

    protected async check(): Promise<void>{
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
                this.setInterval<IRaffle>(remaining - 2000, raffle)
            }else if(Date.now() >= +finishAt){
                await raffle.updateOne({ status: 'ALMOST_DONE' })
                this.setInterval<IRaffle>(1000, raffle)
            }
        }
    }

    protected intervalCallback<T extends Document>(model: T & IRaffle): () => void{
        return async () => {
            await model.updateOne({
                status: 'FINISHED'
            })

            await this.getClient().getRaffleHelper().finishRaffle(model)
        }
    }
    
}