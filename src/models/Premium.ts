import mongoose, { Schema, Document } from 'mongoose';

export enum PremiumType{
    LIMITED,
    PERMANENT
}

export enum PremiumStatus{
    CONTINUES,
    FINISHED,
    CANCELED
}

export interface IPremium extends Document{
    type: PremiumType
    status: PremiumStatus
    startAt: Date
    finishAt: Date
}

const PremiumSchema: Schema = new Schema({
    server_id: {
        type: String,
        required: true
    },
    status: {
        type: PremiumStatus,
        required: true
    },
    type: {
        type: PremiumType,
        required: true
    },
    startAt: {
        type: Date,
        required: true
    },
    finishAt: {
        type: Date,
        required: true
    }
})

export default mongoose.model<IPremium>('Premium', PremiumSchema, 'premiums')
