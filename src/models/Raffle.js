const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RaffleSchema = new Schema({
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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Raffle', RaffleSchema);