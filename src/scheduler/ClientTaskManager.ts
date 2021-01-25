import RaffleTask from './tasks/RaffleTask';
import SurveyTask from './tasks/SurveyTask';
import { IRaffle } from '../models/Raffle';
import { Document } from 'mongoose';
import { StructureTask } from './Task';
import { ISurvey } from '../models/Survey';

interface ClientTask{
    readonly Raffle: RaffleTask
    readonly Survey: SurveyTask
}

export default class ClientTaskManager{

    private readonly raffleTask: RaffleTask = new RaffleTask()
    private readonly surveyTask: SurveyTask = new SurveyTask()

    async executeRaffleTask(items: IRaffle[]){
        return this.executeTask('Raffle', items)
    }

    async executeSurveyTask(items: ISurvey[]){
        return this.executeTask('Survey', items)
    }

    private async executeTask<D extends Document>(task: keyof ClientTask, items: D[]): Promise<void>{
        let executable: StructureTask
        switch(task){
            case 'Raffle':
                executable = this.raffleTask
                break

            case 'Survey':
                executable = this.surveyTask
                break
        }

        executable.onExecute(items).then(void 0)
    }

}
