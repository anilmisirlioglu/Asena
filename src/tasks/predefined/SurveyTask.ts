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
                this.setInterval(remaining - 2000, structure)
            }else if(Date.now() >= +finishAt){
                this.setInterval(1000, structure)
            }
        }
    }

    protected intervalCallback(survey: Survey): () => void{
        return async () => {
            await Promise.all([
                survey.finishSurvey(this.client),
                survey.delete()
            ])
        }
    }

}
