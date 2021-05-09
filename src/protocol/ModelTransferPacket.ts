import ProcessPacket, { ProcessPacketType } from './ProcessPacket'
import { Document } from 'mongoose';
import { continuingGiveawayMetric, continuingSurveyMetric } from '../telemetry/metrics/NumericMetric';

export type TransferableModelTypes = 'Raffle' | 'Survey'

interface IModelTransferPacket<S extends Document>{
    items: S[]
    modelType: TransferableModelTypes
}

export default class ModelTransferPacket<S extends Document> extends ProcessPacket implements IModelTransferPacket<S>{

    items: S[]
    modelType: TransferableModelTypes

    constructor(payload: IModelTransferPacket<S>){
        super({
            type: ProcessPacketType.MODEL_TRANSFER,
            payload
        })
    }

    observeMetric(){
        switch(this.modelType){
            case 'Raffle':
                continuingGiveawayMetric.observe(this.items.length)
                break

            case 'Survey':
                continuingSurveyMetric.observe(this.items.length)
                break
        }
    }

}
