import { DiscordAPIError, HTTPError } from 'discord.js';
import { IGiveaway } from '../../models/Giveaway';
import Task from '../Task';
import Giveaway from '../../structures/Giveaway';
import Server from '../../structures/Server';

export default class GiveawayTask extends Task<Giveaway, IGiveaway>{

    async onExecute(items: IGiveaway[]): Promise<void>{
        for(const giveaway of items){
            const server = await this.client.servers.get(giveaway.server_id)
            if(!server) continue

            const structure = await server.giveaways.get(giveaway.message_id)
            const finishAt: Date = new Date(giveaway.finishAt)
            const remaining: number = +finishAt - Date.now()
            if(remaining <= 60 * 1000){
                await structure.setStatus('ALMOST_DONE')
                this.setInterval(remaining, structure, server)
            }else if(Date.now() >= +finishAt){
                await structure.setStatus('ALMOST_DONE')
                this.setInterval(1000, structure, server)
            }
        }
    }

    protected setInterval(timeout: number, giveaway: Giveaway, server: Server){
        new Promise((resolve, reject) => {
            this.client
                .fetchMessage(giveaway.server_id, giveaway.channel_id, giveaway.message_id)
                .then(async result => {
                    if(!result) return reject()

                    let isRejected = false
                    const updateCallback = async (
                        customTime: number,
                        message: string = Giveaway.getAlertMessage(),
                        alert: boolean = true
                    ) => {
                        if(!isRejected){
                            await result.edit({
                                content: message,
                                embeds: [giveaway.buildEmbed(alert, customTime)]
                            }).catch(async (err: DiscordAPIError | HTTPError) => {
                                const guild = result.guild
                                if(guild){
                                    try{
                                        const owner = await guild.fetchOwner()
                                        await owner?.send({
                                            content: server.translate('errors.message'),
                                            embeds: [this.client.buildErrorReporterEmbed(server.locale, guild, err)]
                                        })
                                    }catch(err){
                                        isRejected = true
                                        return reject(err)
                                    }
                                }

                                isRejected = true
                                return reject(err)
                            })
                        }
                    }

                    setTimeout(async () => {
                        await updateCallback(10, Giveaway.getStartMessage(), false)
                        await this.sleep(7 * 1000)
                        await updateCallback(3)
                        await this.sleep(1000)
                        await updateCallback(2)
                        await this.sleep(1000)
                        await updateCallback(1)

                        if(!isRejected){
                            return resolve(null)
                        }
                    }, timeout - (10 * 1000))
                })
        }).catch(async () => {
            await giveaway.setStatus('FINISHED')
        }).then(() => {
            super.setInterval(500, giveaway, server)
        })
    }

    protected intervalCallback(giveaway: Giveaway, server: Server): () => void{
        return async () => {
            await giveaway.finish(this.client)
        }
    }

    private sleep(ms: number): Promise<any>{
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }

}
