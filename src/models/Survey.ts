import mongoose, { Schema, Document } from 'mongoose'

export interface ISurvey extends Document{
    server_id: string
    channel_id: string
    message_id: string
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