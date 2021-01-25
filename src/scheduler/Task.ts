import { Document } from 'mongoose';
import SuperClient from '../SuperClient';
import { StructureType } from '../structures/Structure';
import Server from '../structures/Server';

export type StructureTask = Task<StructureType, Document>

export default abstract class Task<S extends StructureType, D extends Document>{

    public abstract onExecute(items: D[]): Promise<void>

    protected abstract intervalCallback(structure: S, server: Server): () => void

    protected setInterval(timeout: number, structure: S, server: Server): void{
        setTimeout(this.intervalCallback(structure, server), timeout)
    }

    protected get client(): SuperClient{
        return SuperClient.getInstance()
    }

}
