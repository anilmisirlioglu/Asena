import mongoose, { Document, Schema } from 'mongoose'
import { Snowflake } from 'discord.js';

export type AnswerMap = Map<SurveyAnswer, string[]>

export interface ISurvey extends Document{
    server_id: Snowflake
    channel_id: Snowflake
    message_id: Snowflake
    title: string
    finishAt: Date
    answers: AnswerMap
}

export enum SurveyAnswer{
    TRUE = 'true',
    FALSE = 'false'
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
    finishAt: {
        type: Date,
        required: true
    },
    answers: {
        type: Map,
        of: Array,
        required: true,
        default: {
            [SurveyAnswer.TRUE]: [],
            [SurveyAnswer.FALSE]: []
        }
    }
}, {
    timestamps: true
})

export default mongoose.model<ISurvey>('Survey', SurveySchema)
