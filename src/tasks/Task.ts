import SuperClient from '../SuperClient';
import { StructureType } from '../structures/Structure';
import Server from '../structures/Server';

export default abstract class Task<S extends StructureType>{

    public abstract async onRun(): Promise<void>

    protected abstract intervalCallback(structure: S, server: Server): () => void

    protected setInterval(timeout: number, structure: S, server: Server): void{
        setTimeout(this.intervalCallback(structure, server), timeout)
    }

    protected get client(): SuperClient{
        return SuperClient.getInstance()
    }

}
