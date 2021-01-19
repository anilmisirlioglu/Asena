import SuperClient from '../SuperClient';
import { StructureType } from '../structures/Structure';

export default abstract class Task<S extends StructureType>{

    public abstract onRun(): Promise<void>

    protected abstract intervalCallback(structure: S): () => void

    protected setInterval(timeout: number, structure: S): void{
        setTimeout(this.intervalCallback(structure), timeout)
    }

    protected get client(): SuperClient{
        return SuperClient.getInstance()
    }

}
