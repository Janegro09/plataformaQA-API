/**
 * @fileoverview Schema MongoDB | Schema para la tabla de log nomina
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

var logNomina = new Schema({
    method: {
        type: String,
        required: true
    },
    uFallados: {
        type: Number,
        required: true
    },
    uAgregados: {
        type: Number,
        required: true
    },
    updatedDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('logNomina',logNomina);