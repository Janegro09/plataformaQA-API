/**
 * @fileoverview Schema MongoDB | Schema para la tabla Groups
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