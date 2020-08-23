import mongoose, { Schema, Document } from 'mongoose';
import { ColorResolvable, EmojiResolvable, Snowflake } from 'discord.js';

export type RaffleStatus = 'FINISHED' | 'ALMOST_DONE' | 'CONTINUES' | 'CANCELED'

export interface IRaffleCustomization{
    server_id?: Snowflake
    color?: ColorResolvable
}

export interface IRaffle extends Document{
    prize: string
    server_id: Snowflake
    constituent_id: Snowflake
    channel_id: Snowflake
    message_id?: Snowflake
    numbersOfWinner: number
    status: RaffleStatus
    finishAt: Date
    customization?: IRaffleCustomization
}

const RaffleSchema: Schema = new Schema<IRaffle>({
    prize: {
        type: String,
        required: true
    },
    server_id: {
        type: String,
        required: true
    },
    constituent_id: {
        type: String,
        required: true
    },
    channel_id: {
        type: String,
        required: true
    },
    message_id: {
        type: String,
        unique: true,
        default: null
    },
    numbersOfWinner: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    finishAt: {
        type: Date,
        required: true
    },
    customization: {
        type: Object,
        required: false
    }
}, {
    timestamps: true
})

export default mongoose.model<IRaffle>('Raffle', RaffleSchema)
