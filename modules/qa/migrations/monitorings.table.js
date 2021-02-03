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
    comentariosDevolucion: String,
    fortalezasUsuario: String,
    pasosMejora: String,
    comments: String,
    caseId: {
        type: String,
        required: true
    },
    customSections: String,
    modifiedBy: [
        {
            userId: String, 
            name: String,
            lastName: String,
            legajo: String,
            modifiedAt: {
                type: Date,
                default: Date.now
            }, 
            rol: String,
            actions: []
        }
    ],
    responses: [
        {
            section: String,
            question: String,
            responses: Array,
            parametrizableValue: mongoose.SchemaTypes.Mixed,
            calibrate: Boolean

        }
    ],
    createdBy: {
        type: String,
        required: true
    },
    invalidated: {
        type: mongoose.SchemaTypes.Mixed,
        default: false
    },
    disputar: {
        type: mongoose.SchemaTypes.Mixed,
        default: false
    },
    disputar_response: {
        type: String,
        default: ""
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
    duracionContacto: String,
    improvment: {
        type: String,
        default: "+-"
    },
    status: {
        type: String,
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}); 

module.exports = mongoose.model('monitorings',monitorings);