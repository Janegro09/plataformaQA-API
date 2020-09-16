/**
 * @fileoverview Modulo Forms | Schema para los formularios
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

var forms = new Schema({
    name: {
        type: String,
        required: true
    },
    parts: [
        {
            name: String, 
            customFields: [{customField: String, question: String}]
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    programId: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    description: String
});

module.exports = mongoose.model('forms',forms);