import GiveawayTask from '../tasks/GiveawayTask';
import SurveyTask from '../tasks/SurveyTask';
import { IGiveaway } from '../../models/Giveaway';
import { Document } from 'mongoose';
import { StructureTask } from '../Task';
import { ISurvey } from '../../models/Survey';

interface ClientTask{
    readonly Giveaway: GiveawayTask
    readonly Survey: SurveyTask
}

export default class ClientTaskManager{

    private readonly giveawayTask: GiveawayTask = new GiveawayTask()
    private readonly surveyTask: SurveyTask = new SurveyTask()

    async executeGiveawayTask(items: IGiveaway[]){
        return this.executeTask('Giveaway', items)
    }

    async executeSurveyTask(items: ISurvey[]){
        return this.executeTask('Survey', items)
    }

    private async executeTask<D extends Document>(task: keyof ClientTask, items: D[]): Promise<void>{
        let executable: StructureTask
        switch(task){
            case 'Giveaway':
                executable = this.giveawayTask
                break

            case 'Survey':
                executable = this.surveyTask
                break
        }

        executable.onExecute(items).then(void 0)
    }

}
