import RaffleModel from '../../models/Raffle';
import Task from '../Task';
import Raffle from '../../structures/Raffle';

export default class RaffleTask extends Task<Raffle>{

    async onRun(): Promise<void>{
        const cursor = await RaffleModel
            .find({ status: 'CONTINUES' })
            .cursor()

        for(let raffle = await cursor.next(); raffle !== null; raffle = await cursor.next()){
            const structure = new Raffle(raffle)
            const finishAt: Date = new Date(raffle.finishAt)
            const remaining: number = +finishAt - Date.now()
            if(remaining <= 60 * 1000){
                await raffle.updateOne({ status: 'ALMOST_DONE' })
                this.setInterval(remaining, structure)
            }else if(Date.now() >= +finishAt){
                await raffle.updateOne({ status: 'ALMOST_DONE' })
                this.setInterval(1000, structure)
            }
        }
    }

    protected setInterval(timeout: number, raffle: Raffle){
        new Promise(resolve => {
            this.getClient()
                .fetchMessage(raffle.server_id, raffle.channel_id, raffle.message_id)
                .then(async result => {
                    if(result){
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
        }).then(() => super.setInterval(500, raffle))
    }

    protected intervalCallback(raffle: Raffle): () => void{
        return async () => {
            await raffle.finish(this.getClient())
        }
    }

    private sleep(ms: number): Promise<any>{
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }

}
