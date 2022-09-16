import mongoose, { Schema, Document } from 'mongoose';
import { ColorResolvable, Snowflake } from 'discord.js';

export enum RaffleVersion{
    Reaction,
    Interaction
}

export type RaffleStatus = 'FINISHED' | 'ALMOST_DONE' | 'CONTINUES' | 'CANCELED'

export interface IPartialServer{
    id: Snowflake
    invite: string
    name: string
}

export interface IRaffle extends Document{
    prize: string
    server_id: Snowflake
    constituent_id: Snowflake
    channel_id: Snowflake
    message_id?: Snowflake
    numberOfWinners: number
    status: RaffleStatus
    finishAt: Date
    servers?: IPartialServer[]
    allowedRoles?: Snowflake[]
    rewardRoles?: Snowflake[]
    color?: ColorResolvable
    winners?: Snowflake[]
    banner?: string
    participants: Snowflake[]
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
    numberOfWinners: {
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
    participants: {
        type: Array,
        default: [],
        required: true
    }
}, {
    timestamps: true,
    strict: false,
    strictQuery: true
})

RaffleSchema.pre('findOneAndUpdate', function(){
    const setOnInsert = this.getUpdate()['$setOnInsert']
    if(setOnInsert != null && setOnInsert.__v !== undefined){
        setOnInsert.__v = RaffleVersion.Interaction
    }
})

export default mongoose.model<IRaffle>('Raffle', RaffleSchema)
