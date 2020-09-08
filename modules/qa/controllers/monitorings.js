/**
 * @fileoverview Modulo QA
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

const monModel = require('../models/monitorings');

const controller = {
    /**
     * Funcion para crear un nuevo monitoreo,
     * recauda la informacion del programa y del usuario y crea un nuevo monitoreo
     */
    new: async (req, res) => {

        if(!req.body) return includes.views.error.message(res, "Error en los parametros enviados");
        try {
            let data = {
                ...req.body,
                createdBy: ""
            }

            // Especificamos el id del usuario que esta logeado
            if(req.authUser.length > 0) {
                data.createdBy = req.authUser[0].id;
            }

        
            let mon = new monModel(data);

            let save = await mon.save();
            if(!save) return includes.views.error.message(res, "Error al crear monitoreo");

            if(req.files) {
                let saveFile = await monModel.saveFile(save._id, req);
                if(!saveFile) return includes.views.error.message(res, "Error al guardar los archivos del monitoreo");
            }

            return includes.views.success.create(res);
        } catch (e) {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        }

    },
    get: async (req, res) => {
        const { id } = req.params;

        monModel.get(id, req.query, req).then(v => {

            if(!v) return includes.views.error.message(res, "Error al obtener monitoreos");
            else if(v.length === 0) return includes.views.error.message(res, "No hay monitoreos para mostrar");
            else return includes.views.customResponse(res, true, 200, "", v);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })

    },
    export: async (req, res) => {
        const { monitoringsIds } = req.body;

        if(!monitoringsIds) return includes.views.error.message(res, "Error en los parametros enviados");

        monModel.export(monitoringsIds).then(v => {
            if(!v) return includes.views.error.message(res, "Error al obtener los monitoreos monitoreos");
            else return includes.views.customResponse(res, true, 200, "", v);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })
    },
    modify: async (req, res) => {
        const { id } = req.params;

        if(!id || !req.body) return includes.views.error.message(res, "Error en los parametros enviados");

        let userId   = req.authUser[0].id        || false
        let userRole = req.authUser[0].role.role || false

        monModel.modify(id, req.body, {userId, userRole}).then(v => {
            if(!v) return includes.views.error.message(res, "Error al modificar el monitoreo");
            else return includes.views.success.update(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })

    },
    delete: async (req, res) => {
        const { id } = req.params;

        if(!id) return includes.views.error.message(res, "Error en los parametros enviados");

        let userId   = req.authUser[0].id        || false
        let userRole = req.authUser[0].role.role || false

        monModel.delete(id, {userId, userRole}).then(v => {
            if(!v) return includes.views.error.message(res, "Error al eliminar el monitoreo");
            else return includes.views.success.delete(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })
    },
    uploadFile: async (req, res) => {
        const { id } = req.params;

        if(!id || !req.files) return includes.views.error.message(res, "Error en los parametros enviados");

        try {
            let saveFile = await monModel.saveFile(id, req);
            if(!saveFile) return includes.views.error.message(res, "Error al guardar los archivos del monitoreo");

            return includes.views.success.create(res);
        } catch (e) {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        }

    },
    deleteFile: async (req, res) => {
        const { id, file } = req.params;

        if(!id || !file) return includes.views.error.message(res, "Error en los parametros enviados");

        monModel.deleteFile(id, file).then(v => {
            if(!v) return includes.views.error.message(res, "Error al eliminar el archivo");
            else return includes.views.success.delete(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })
    }
}

module.exports = controller;