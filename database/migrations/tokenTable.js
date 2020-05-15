const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

var Tokens = new Schema({
    userId: {
        type: Object,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Tokens',Tokens);