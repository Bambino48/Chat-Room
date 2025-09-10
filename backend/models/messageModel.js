const mongoose = require('mongoose');

const messageModel = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            trim: true,
        },
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        type: {
            type: String,
            enum: ['text', 'file'],
            default: 'text',
        },
        file: {
            name: { type: String },
            url: { type: String },
            mimeType: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model('Message', messageModel);
module.exports = Message;
