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

const groupsModel = require('../models/programsGroups');

const controller = {
    create: (req, res) => {
        if(!req.body.name) return includes.views.error.message(res, "Error en los parametros enviados");
        const programGroup = new groupsModel(req.body);
        return programGroup.save().then(response => {
            if(response === true) return includes.views.success.create(res);
            else return includes.views.error.message(res, "Error al crear el programa"); 
        }, err => {
            return includes.views.error.message(res, err.message);
        })
    },
    modify: (req, res) => {

    },
    get: (req, res) => {
        
    },
    delete: (req, res) => {

    }
}

module.exports = controller