import Structure from '../structures/Structure';
import { Document, Model } from 'mongoose';

abstract class Manager<K, V extends Structure<M, D>, M extends Model<D>, D extends Document>{

    protected cache: Map<K, V> = new Map<K, V>()
    protected model: M

    protected constructor(model: M){
        this.model = model
    }

    protected abstract key(): string

    protected abstract new(data: D): V

    async get(key: K): Promise<V | undefined>{
        if(this.exists(key)){
            return this.cache.get(key)
        }

        const data = await this.model.findOne({
            [this.key()]: key
        } as any)

        if(!data){
            return undefined
        }

        const structure = this.new(data)
        this.set(structure.identifier_id, structure)

        return structure
    }

    async create(data: D): Promise<V>{
        const create = await this.model.create(data as any)
        const structure = this.new(create)

        this.set(structure.identifier_id, structure)

        return structure
    }

    set(key: any, value: V){
        this.cache.set(key, value)
    }

    exists(key: K): boolean{
        return this.cache.has(key)
    }

    last(): V | undefined{
        const array = Array.from(this.cache.keys())

        return this.cache.get(array[array.length - 1])
    }

}

export default Manager
