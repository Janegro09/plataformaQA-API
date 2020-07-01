/**
 * @fileoverview Modulo Programs | Schema de partitures
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

var partitures = new Schema({
    name: {
        type: String,
        required: true
    },
    fileId: {
        type: String,
        required: true
    },
    perfilamientos: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('partitures',partitures);