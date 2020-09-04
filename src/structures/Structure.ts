import { Types, UpdateQuery, Document, Model } from 'mongoose';
import Timestamps from '../models/legacy/Timestamps';
import ID from '../models/legacy/ID';
import { Snowflake } from 'discord.js';

type SuperDocument = Document & ID & Timestamps

export type StructureType = Structure<Model<SuperDocument>, SuperDocument>

abstract class Structure<M extends Model<D>, D extends SuperDocument>{

    protected model: M

    public id: Types.ObjectId // Mongoose ID
    public identifier_id: Snowflake // Discord ID
    public createdAt: Date
    public updatedAt: Date

    public deleted: boolean = false

    protected constructor(model: M, data: D){
        this.model = model

        this.id = data._id
        this.identifier_id = data[this.identifierKey()]
        this.createdAt = data.createdAt
        this.updatedAt = data.updatedAt

        this.patch(data)
    }

    protected abstract identifierKey(): string

    protected abstract patch(data: D)

    async update(query: UpdateQuery<D>, rePatch: boolean = true){
        const update = await this.model.findByIdAndUpdate(this.id, query, {
            new: rePatch
        })

        this.patch(update)
    }

    async delete(){
        await this.model.findByIdAndDelete(this.id)

        this.deleted = true
    }

    isDeleted(): boolean{
        return this.deleted
    }

}

export default Structure
