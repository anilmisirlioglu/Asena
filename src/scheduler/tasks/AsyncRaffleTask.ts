import AsyncTask from '../AsyncTask';
import RaffleModel, { IRaffle } from '../../models/Raffle';
import { TransferableModelTypes } from '../../protocol/ModelTransferPacket';

export default class AsyncRaffleTask extends AsyncTask<IRaffle>{

    async onRun(): Promise<IRaffle[]>{
        return RaffleModel.find({ status: 'CONTINUES' });
    }

    protected getModelType = (): TransferableModelTypes => 'Raffle'

}
