/**
 * @fileoverview Modulo Programs | Schema de archivos de partituras
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

var filesbypartitures = new Schema({
    fileId: {
        type: String,
        required: true
    },
    partitureId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
    },
    stepId: {
        type: String,
        required: true
    },
    section: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('filesbypartitures',filesbypartitures);