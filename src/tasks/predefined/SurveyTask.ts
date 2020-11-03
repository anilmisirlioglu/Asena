import SurveyModel from '../../models/Survey';
import Task from '../Task';
import Survey from '../../structures/Survey';

export default class SurveyTask extends Task<Survey>{

    async onRun(): Promise<void>{
        const cursor = await SurveyModel.find({}).cursor()
        for(let survey = await cursor.next(); survey !== null; survey = await cursor.next()){
            const structure = new Survey(survey)
            const finishAt: Date = new Date(survey.finishAt)
            const remaining: number = +finishAt - Date.now()
            if(remaining <= 60 * 1000){
                await this.setInterval(remaining - 2000, structure)
            }else if(Date.now() >= +finishAt){
                await this.setInterval(1000, structure)
            }
        }
    }

    protected async setInterval(timeout: number, survey: Survey){
        const message = await this.client.fetchMessage(survey.server_id, survey.channel_id, survey.message_id)
        if(message){
            super.setInterval(timeout, survey)
        }else{
            await survey.delete()
        }
    }

    protected intervalCallback(survey: Survey): () => void{
        return async () => {
            await survey.finishSurvey(this.client)
            await survey.delete()
        }
    }

}
