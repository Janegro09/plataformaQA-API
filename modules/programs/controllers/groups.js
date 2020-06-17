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
            else return includes.views.error.message(res, "Error al crear el grupo"); 
        }, err => {
            return includes.views.error.message(res, err.message);
        })
    },
    modify: (req, res) => {
        const programGroup = new groupsModel(req.body);
        programGroup.assingID(req.params.id);
        return programGroup.modify().then(response => {
            if(response === true) return includes.views.success.update(res);
            else return includes.views.error.message(res, "Error al actualizar el grupo"); 
        }, err => {
            return includes.views.error.message(res, err.message);
        })
    },
    get: (req, res) => {
        if(req.params.id){
            return groupsModel.get(req).then(response => {
                if(!response) return includes.views.error.message(res, "Error al mostrar los grupos de programas");
                else {
                    includes.views.customResponse(res, true, 200, "", response);
                }
            }, err => {
                return includes.views.error.message(res, err.message);
            })
        }else{
            return groupsModel.get().then(response => {
                if(!response) return includes.views.error.message(res, "Error al mostrar los grupos de programas");
                else {
                    includes.views.customResponse(res, true, 200, "", response);
                }
            }, err => {
                return includes.views.error.message(res, err.message);
            })
        }
    },
    delete: (req, res) => {
        return groupsModel.delete(req.params.id).then(response => {
            if(!response) return includes.views.error.message(res, "Error el eliminar el grupo de programas");
            else {
                includes.views.success.delete(res);
            }
        }, err => {
            return includes.views.error.message(res, err.message);
        })
    },
    unassignUser: (req, res) => {
        if(req.params.groupId && req.params.userId){
            const groupId = req.params.groupId;
            const userId  = req.params.userId;
            return groupsModel.unassignUser(groupId, userId).then(response => {
                if(!response) return includes.views.error.message(res, "Error al desasignar usuario");
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