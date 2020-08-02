import SuperClient from '../SuperClient';
import { Document } from 'mongoose';

export default abstract class Task{

    public abstract async onRun(): Promise<void>

    protected abstract intervalCallback<T extends Document>(model: T): () => void

    protected setInterval<T extends Document>(timeout: number, document: T): void{
        setTimeout(this.intervalCallback(document), timeout)
    }

    protected getClient(): SuperClient{
        return SuperClient.getInstance()
    }

}
