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

var perfilamientoPerUserHistory = new Schema({
    userId: {
        type: String,
        required: true
    },
    cluster: {
        type: String,
        required: true
    },
    file: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('perfilamientoPerUserHistory',perfilamientoPerUserHistory);