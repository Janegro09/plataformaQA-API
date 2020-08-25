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
    name: String,
    calibrators: Array,
    expert: String,
    monitoringsIds: Array,
    caseId: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    responses: String,
    description: String,
    startDate: Date,
    endDate: Date,
    Status_open: {
        type: Boolean,
        default: true
    },
    calibrationType: String

});

module.exports = mongoose.model('calibrations',calibrations);