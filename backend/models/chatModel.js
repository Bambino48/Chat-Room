const mongoose = require('mongoose');

const chatModel = mongoose.Schema({
    chatName: {
        type: String,
        trim: true,
        required: true,
    },
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    isPublic: {
        type: Boolean,
        default: false,
    },
    avatar: { // ✅ Avatar du salon
        type: String,
        default: "https://icon-library.com/images/group-icon-png/group-icon-png-14.jpg",
    },
    description: { // ✅ Description du salon
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

const Chat = mongoose.model('Chat', chatModel);
module.exports = Chat;
