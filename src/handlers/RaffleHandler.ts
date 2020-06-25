import cron from 'node-cron';
import Raffle, { IRaffle } from '../models/Raffle';
import Handler from './Handler';
import { SuperClient } from '../Asena';

export class RaffleHandler extends Handler{

    constructor(client: SuperClient){
        super(client)

        this.startJobSchedule()
    }

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

            await this.client.getRaffleHelper().finishRaffle(raffle)
        }, timeout)
    }
    
}