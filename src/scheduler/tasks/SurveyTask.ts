import { ISurvey } from '../../models/Survey';
import Task from '../Task';
import Survey from '../../structures/Survey';
import Server from '../../structures/Server';

export default class SurveyTask extends Task<Survey, ISurvey>{

    async onExecute(items: ISurvey[]): Promise<void>{
        for(const survey of items){
            const server = await this.client.servers.get(survey.server_id)
            if(!server) continue

            const structure = new Survey(survey)
            const finishAt: Date = new Date(survey.finishAt)
            const remaining: number = +finishAt - Date.now()
            if(remaining <= 60 * 1000){
                await this.setInterval(remaining - 2000, structure, server)
            }else if(Date.now() >= +finishAt){
                await this.setInterval(1000, structure, server)
            }
        }
    }

    protected async setInterval(timeout: number, survey: Survey, server: Server){
        const message = await this.client.fetchMessage(survey.server_id, survey.channel_id, survey.message_id)
        if(message){
            super.setInterval(timeout, survey, server)
        }else{
            await survey.delete()
        }
    }

    protected intervalCallback(survey: Survey, server: Server): () => void{
        return async () => {
            await Promise.all([
                survey.finish(this.client, server),
                survey.delete()
            ])
        }
    }

}
