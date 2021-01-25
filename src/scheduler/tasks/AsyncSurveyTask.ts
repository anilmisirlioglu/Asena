import AsyncTask from '../AsyncTask';
import Survey, { ISurvey } from '../../models/Survey';
import { TransferableModelTypes } from '../../protocol/ModelTransferPacket';

export default class AsyncSurveyTask extends AsyncTask<ISurvey>{

    async onRun(): Promise<ISurvey[]>{
        return Survey.find({})
    }

    protected getModelType = (): TransferableModelTypes => 'Survey'

}
