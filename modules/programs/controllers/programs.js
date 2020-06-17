/**
 * @fileoverview Modulo Programs
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
const includes = require('../../includes');

const programModel = require('../models/programs');

const controller = {
    create: (req, res) => {
        if(!req.body.name) return includes.views.error.message(res, "Error en los parametros enviados");
        const program = new programModel(req.body);
        program.assignCreatedBy(req);
        return program.save().then(response => {
            if(response === true) return includes.views.success.create(res);
            else return includes.views.error.message(res, "Error al crear el programa"); 
        }, err => {
            return includes.views.error.message(res, err.message);
        })
    },
    modify: (req, res) => {

    },
    get: (req, res) => {
        console.log(req.params)
    },
    delete: (req, res) => {

    }
}

module.exports = controller