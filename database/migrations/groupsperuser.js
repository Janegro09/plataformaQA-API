const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

var GroupsPerUser = new Schema({
    groupId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('GroupsPerUser',GroupsPerUser);