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
        if(!req.params.id) return includes.views.error.message(res, "Error en los parametros enviados");
        const program = new programModel(req.body);
        program.id = req.params.id;
        return program.modify().then(response => {
            if(response === true) return includes.views.success.update(res);
            else return includes.views.error.message(res, "Error al modificar el programa"); 
        }, err => {
            return includes.views.error.message(res, err.message);
        })
    },
    get: (req, res) => {
        return programModel.get(req).then(response => {
            if(!response) return includes.views.error.message(res, "Error al mostrar los programas");
            else {
                includes.views.customResponse(res, true, 200, "", response);
            }
        }, err => {
            return includes.views.error.message(res, err.message);
        })
    },
    delete: (req, res) => {
        return programModel.delete(req.params.id).then(response => {
            if(!response) return includes.views.error.message(res, "Error el eliminar el programa");
            else {
                includes.views.success.delete(res);
            }
        }, err => {
            return includes.views.error.message(res, err.message);
        })
    },
    unassignGroup: (req, res) => {
        if(req.params.programId && req.params.groupId){
            const programId = req.params.programId;
            const groupId  = req.params.groupId;
            return programModel.unassignGroup(programId, groupId).then(response => {
                if(!response) return includes.views.error.message(res, "Error al desasignar grupo");
                else return includes.views.success.update(res);
            }, err => {
                return includes.views.error.message(res, err.message);
            })
        }else{
            return includes.views.error.message(res, "Error en los parametros enviados");
        }

    }
}

module.exports = controller