import AsyncTask from '../AsyncTask';
import GiveawayModel, { IGiveaway } from '../../models/Giveaway';
import { TransferableModelTypes } from '../../protocol/ModelTransferPacket';

export default class AsyncGiveawayTask extends AsyncTask<IGiveaway>{

    async onRun(): Promise<IGiveaway[]>{
        return GiveawayModel.find({ status: 'CONTINUES' });
    }

    protected getModelType = (): TransferableModelTypes => 'Giveaway'

}
