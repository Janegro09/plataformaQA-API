/**
 * @fileoverview Modulo QA | Schema para monitoring
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

var monitorings = new Schema({
    userId: {
        type: String,
        required: true
    },
    transactionDate: Date,
    monitoringDate: Date,
    devolucion: Object,
    comments: String,
    caseId: {
        type: String,
        required: true
    },
    customSections: String,
    responses: [
        {
            section: String,
            questions: [
                {
                    question: String,
                    section: String,
                    response: String
                }
            ]

        }
    ],
    createdBy: {
        type: String,
        required: true
    },
    monitoringsFields: [],
    calibrationsFields: [],
    invalidated: {
        type: mongoose.SchemaTypes.Mixed,
        default: false
    },
    disputar: {
        type: mongoose.SchemaTypes.Mixed,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    evaluated: {
        type: Boolean,
        default: false
    },
    programId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    updatedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}); 

module.exports = mongoose.model('monitorings',monitorings);