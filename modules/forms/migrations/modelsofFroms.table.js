/**
 * @fileoverview Modulo Forms | Schema para los modelos de formularios
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

var modelOfForms = new Schema({
    name: {
        type: String,
        required: true
    },
    parts: [{name: String, customFields: Array}],
    createdAt: {
        type: Date,
        default: Date.now
    },
    section: {
        type: String,
        required: true
    },
    subsection: String,
    description: String
});

module.exports = mongoose.model('modelOfForms',modelOfForms);