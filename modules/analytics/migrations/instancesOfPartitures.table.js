/**
 * @fileoverview Modulo Programs | Schema de instancias de partituras
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

var instancesOfPartitures = new Schema({
    name: {
        type: String,
        required: true
    },
    partitureId: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
    },
    blockingDate: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('instancesOfPartitures',instancesOfPartitures);