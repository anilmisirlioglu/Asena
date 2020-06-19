import mongoose, { Schema, Document } from 'mongoose';

export interface IServer extends Document{
    prefix: string,
    server_id: string,
    publicCommands: string[]
}

const ServerSchema: Schema = new Schema<IServer>({
    prefix: {
        type: String,
        default: process.env.PREFIX
    },
    server_id: {
        type: String,
        required: true
    },
    publicCommands: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})

export default mongoose.model<IServer>('Server', ServerSchema)