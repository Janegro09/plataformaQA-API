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
    completed: {
        type: Boolean,
        default: false
    },
    requestedMonitorings: {
        type: Number,
        default: 0
    },
    assignedMonitorings: {
        type: Array
    },
    responsibleComments: {
        type: String
    },
    managerComments: {
        type: String
    },
    coordinatorOnSiteComments: {
        type: String
    },
    accountAdministratorComments: {
        type: String
    },
    audioFile: String
});

module.exports = mongoose.model('stepsOfInstances',stepsOfInstances);