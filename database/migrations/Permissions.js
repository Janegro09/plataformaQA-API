const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

var Permissions = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    group: {
        type: String,
        required: true
    },
    route: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('Permissions',Permissions);