import RaffleModel, { IRaffle } from '../../models/Raffle';
import Task from '../Task';
import { Document } from 'mongoose';
import Raffle from '../../structures/Raffle';

export default class RaffleTask extends Task{

    async onRun(): Promise<void>{
        const cursor = await RaffleModel
            .find({ status: 'CONTINUES' })
            .cursor()

        for(let raffle = await cursor.next(); raffle !== null; raffle = await cursor.next()){
            const finishAt: Date = new Date(raffle.finishAt)
            const remaining: number = +finishAt - Date.now()
            if(remaining <= 60 * 1000){
                await raffle.updateOne({ status: 'ALMOST_DONE' })
                this.setInterval<IRaffle>(remaining, raffle)
            }else if(Date.now() >= +finishAt){
                await raffle.updateOne({ status: 'ALMOST_DONE' })
                this.setInterval<IRaffle>(1000, raffle)
            }
        }
    }

    protected setInterval<T extends Document>(timeout: number, document: T & IRaffle){
        new Promise(resolve => {
            this.getClient()
                .fetchMessage(document.server_id, document.channel_id, document.message_id)
                .then(async result => {
                    if(result){
                        const raffle = new Raffle(document)
                        const updateCallback = async (
                            customTime: number,
                            message: string = Raffle.getAlertMessage(),
                            alert: boolean = true
                        ) => {
                            await result.edit(message, {
                                embed: raffle.getEmbed(alert, customTime)
                            })
                        }

                        await setTimeout(async () => {
                            await updateCallback(10, Raffle.getStartMessage(), false)
                            await this.sleep(7 * 1000)
                            await updateCallback(3)
                            await this.sleep(1000)
                            await updateCallback(2)
                            await this.sleep(1000)
                            await updateCallback(1)

                            resolve()
                        }, timeout - (10 * 1000))
                    }else{
                        resolve()
                    }
                })
                .catch(resolve)
        }).then(() => super.setInterval(500, document))
    }

    protected intervalCallback<T extends Document>(document: T & IRaffle): () => void{
        return async () => {
            await new Raffle(document).finish(this.getClient())
        }
    }

    private sleep(ms: number): Promise<any>{
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }

}
