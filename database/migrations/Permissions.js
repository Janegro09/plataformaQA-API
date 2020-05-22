/**
 * @fileoverview Schema MongoDB | Schema para la tabla Permissions
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