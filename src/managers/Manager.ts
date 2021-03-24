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

    /**
     * If already exists fetch from cache but if not, fetch from database
     */
    async get(key: K): Promise<V | undefined>{
        if(this.exists(key)){
            return this.cache.get(key)
        }

        return this.fetch(key)
    }

    /**
     * Direct fetch from Database
     */
    async fetch(key: K): Promise<V | undefined>{
        return new Promise(resolve => {
            // @ts-ignore
            this.model.findOne({
                [this.key()]: key
            }, (err, item) => {
                if(err) resolve(undefined)

                resolve(this.setCacheFromRawDocument(item))
            })
        })
    }

    async create(data: D): Promise<V>{
        const create = await this.model.findOneAndUpdate({
            [this.key()]: data[this.key()]
        } as any, data, {
            upsert: true,
            new: true
        })

        return this.setCacheFromRawDocument(create)
    }

    setCacheFromRawDocument(doc: D): V{
        const structure = this.new(doc)
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
