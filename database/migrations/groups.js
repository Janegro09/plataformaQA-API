const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

var Groups = new Schema({
    group: {
        type: String,
        required: true,
        unique: true
    },
    groupDeleted: {
        type: Boolean,
        default: false
    }
});

let Model = mongoose.model('Groups',Groups);

let mainGroup = new Model({
    group: "General"
})
mainGroup.save().then(ok => ok).catch((err) => {
}); 


module.exports = Model;