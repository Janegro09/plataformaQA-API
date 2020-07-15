/**
 * @fileoverview Modulo Forms | Schema para los campos personalizados
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

var customfields = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    values: Array,
    required: {
        type: Boolean,
        default: false
    },
    format: String,
    description: String,
    section: String,
    subsection: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('customfields',customfields);