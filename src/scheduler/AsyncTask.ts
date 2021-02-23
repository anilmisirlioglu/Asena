import { Document } from 'mongoose';
import { ShardingManager } from 'discord.js';
import ModelTransferPacket, { TransferableModelTypes } from '../protocol/ModelTransferPacket';

export type AsyncDocumentTask = AsyncTask<Document>

export default abstract class AsyncTask<S extends Document>{

    abstract onRun(): Promise<S[]>

    async onCompletion(sharding: ShardingManager, items: S[]): Promise<void>{
        const packet = new ModelTransferPacket({
            items,
            modelType: this.getModelType()
        })

        sharding.shards.map(shard => shard.send(packet))
    }

    protected abstract getModelType(): TransferableModelTypes

}
