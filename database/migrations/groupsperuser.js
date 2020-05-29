/**
 * @fileoverview Schema MongoDB | Schema para la tabla Groupsperuser
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