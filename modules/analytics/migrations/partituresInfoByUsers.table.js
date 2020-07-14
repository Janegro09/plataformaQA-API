/**
 * @fileoverview Modulo Programs | Schema para info extra de partituras segun usuarios
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

var partituresInfoByUsers = new Schema({
    partitureId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending"
    },
    improvent: String,
    modifications: Array
});

module.exports = mongoose.model('partituresInfoByUsers',partituresInfoByUsers);