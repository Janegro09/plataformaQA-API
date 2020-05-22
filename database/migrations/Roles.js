/**
 * @fileoverview Schema MongoDB | Schema para la tabla Roles
 * 
 * @version 1.0
 * 
 * @author Soluciones Digitales - Telecom Argentina S.A.
 * @author Ramiro Macciuci <rmacciucivicente@teco.com.ar>
 * @copyright Soluciones Digitales - Telecom Argentina
 * 
 * History:
 * 1.0 - Version principal
 */

// Incluimos controladores, modelos, schemas y modulos
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

var Roles = new Schema({
    role: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ""
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