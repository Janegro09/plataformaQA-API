/**
 * @fileoverview Modulo Programs | Schema de pasos por instancias
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

var stepsOfInstances = new Schema({
    name: {
        type: String,
        required: true
    },
    instanceId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    partitureId: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    requestedMonitorings: {
        type: Number,
        default: 0
    },
    customFilesSync: Array,
    detalleTransaccion: String,
    patronMejora: String,
    compromisoRepresentante: String,
    fechaInforme: Date,
    responsibleComments: String,
    managerComments: String,
    coordinatorOnSiteComments: String,
    coordinatorComments: String,
    coordinatorOCComments: String,
    accountAdministratorComments: String,
    coachingComments: String,
    resultadosRepresentante: String,
    improvment: {
        type: String,
        default: '+-'
    },
    last_modification: Date
});

module.exports = mongoose.model('stepsOfInstances',stepsOfInstances);