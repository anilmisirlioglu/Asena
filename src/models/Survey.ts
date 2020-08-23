import mongoose, { Schema, Document } from 'mongoose'
import { Snowflake } from 'discord.js';

export interface ISurvey extends Document{
    server_id: Snowflake
    channel_id: Snowflake
    message_id: Snowflake
    title: string
    finishAt: Date
}

const SurveySchema = new Schema({
    server_id: {
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
        required: true
    },
    title: {
        type: String,
        required: true
    },
    finishAt:{
        type: Date,
        required: true
    }
}, {
    timestamps: true
})

export default mongoose.model<ISurvey>('Survey', SurveySchema)
