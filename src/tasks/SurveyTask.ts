import Survey, { ISurvey } from '../models/Survey';
import Task from './Task';
import { Document } from 'mongoose';

export default class SurveyTask extends Task{

    async onRun(): Promise<void>{
        const cursor = await Survey.find({}).cursor()
        for(let survey = await cursor.next(); survey !== null; survey = await cursor.next()){
            const finishAt: Date = new Date(survey.finishAt)
            const remaining: number = +finishAt - Date.now()
            if(remaining <= 60 * 1000){
                this.setInterval<ISurvey>(remaining - 2000, survey)
            }else if(Date.now() >= +finishAt){
                this.setInterval<ISurvey>(1000, survey)
            }
        }
    }

    protected intervalCallback<T extends Document>(model: T & ISurvey): () => void{
        return async () => {
            await model.remove()

            await this.getClient().getSurveyHelper().finishSurvey(model)
        }
    }

}