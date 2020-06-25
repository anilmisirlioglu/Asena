import cron from 'node-cron';
import Handler from './Handler';
import Survey, { ISurvey } from '../models/Survey';
import { SuperClient } from '../Asena';

export class SurveyHandler extends Handler{

    constructor(client: SuperClient){
        super(client);

        this.startJobSchedule()
    }

    public startJobSchedule(): void{
        cron.schedule('* * * * *', async () => {
            await this.checkSurveys()
        })
    }

    private async checkSurveys(){
        const cursor = await Survey.find({}).cursor()
        for(let survey = await cursor.next(); survey !== null; survey = await cursor.next()){
            const finishAt: Date = new Date(survey.finishAt)
            const remaining: number = +finishAt - Date.now()
            if(remaining <= 60 * 1000){
                this.setSurveyInterval(remaining - 2000, survey)
            }else if(Date.now() >= +finishAt){
                this.setSurveyInterval(1000, survey)
            }
        }
    }

    private setSurveyInterval(timeout: number, survey: ISurvey): void{
        setTimeout(async () => {
            await survey.remove()

            await this.client.getSurveyHelper().finishSurvey(survey)
        }, timeout)
    }

}