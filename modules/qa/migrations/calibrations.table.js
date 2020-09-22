/**
 * @fileoverview Modulo QA | Schema para calibraciones
 *
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

var calibrations = new Schema({
    calibrators: Array,
    expert: String,
    caseId: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    startDate: Date,
    endDate: Date,
    status_open: {
        type: Boolean,
        default: true
    },
    calibrationType: String

});

module.exports = mongoose.model('calibrations',calibrations);