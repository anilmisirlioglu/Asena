import mongoose, { Schema, Document } from 'mongoose';
import { Snowflake } from 'discord.js';

export type PremiumType = 'LIMITED' | 'PERMANENT'

export interface IPremium{
    type: PremiumType
    startAt: Date
    finishAt: Date
}

export interface IServer extends Document{
    prefix?: string,
    server_id: Snowflake,
    publicCommands: string[],
    premium?: IPremium
}

const ServerSchema: Schema = new Schema<IServer>({
    prefix: {
        type: String,
        default: '!a'
    },
    server_id: {
        type: String,
        required: true
    },
    publicCommands: {
        type: Array,
        default: []
    },
    premium: {
        type: Object,
        default: null
    }
}, {
    timestamps: true
})

export default mongoose.model<IServer>('Server', ServerSchema)
