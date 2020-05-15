const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

var Roles = new Schema({
    role: {
        type: String,
        required: true,
        unique: true
    },
    roleDeleted: {
        type: Boolean,
        default: false
    },
    permissionAssign: {
        type: Array,
        default: []
    }
});

let Model = mongoose.model('Roles',Roles);

let AdministratorRol = new Model({
    role: "Administrator",
    permissionAssign: "all"
})
AdministratorRol.save().then(ok => ok).catch((err) => {
}); 


module.exports = Model;