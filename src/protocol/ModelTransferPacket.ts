import ProcessPacket, { ProcessPacketType } from './ProcessPacket'
import { Document } from 'mongoose';
import {
    continuingExVersionGiveawayMetric,
    continuingGiveawayMetric,
    continuingSurveyMetric
} from '../telemetry/metrics/NumericMetric';
import { RaffleVersion } from '../models/Raffle';

export type TransferableModelTypes = 'Raffle' | 'Survey'

interface ModelTransferPacketPayload<S extends Document>{
    items: S[]
    modelType: TransferableModelTypes
}

export default class ModelTransferPacket<S extends Document> extends ProcessPacket implements ModelTransferPacketPayload<S>{

    readonly type: ProcessPacketType.ModelTransfer = ProcessPacketType.ModelTransfer
    items: S[]
    modelType: TransferableModelTypes

    constructor(payload: ModelTransferPacketPayload<S>){
        super(payload)
    }

    observeMetric(){
        switch(this.modelType){
            case 'Raffle':
                continuingGiveawayMetric.observe(this.items.length)
                continuingExVersionGiveawayMetric.observe(this.items.filter(item => item.__v == RaffleVersion.Reaction).length)
                break

            case 'Survey':
                continuingSurveyMetric.observe(this.items.length)
                break
        }
    }

}
