import ProcessPacket, { ProcessPacketType } from './ProcessPacket'
import { Document } from 'mongoose';

export type TransferableModelTypes = 'Raffle' | 'Survey'

interface IModelTransferPacket<S extends Document>{
    items: S[]
    modelType: TransferableModelTypes
}

export default class ModelTransferPacket<S extends Document> extends ProcessPacket implements IModelTransferPacket<S>{

    items: S[]
    modelType: TransferableModelTypes

    constructor(data: IModelTransferPacket<S>){
        super({
            type: ProcessPacketType.MODEL_TRANSFER,
            data
        })
    }

}
