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

            let saveFile = await monModel.saveFile(save._id, req);
            if(!saveFile) return includes.views.error.message(res, "Error al guardar los archivos del monitoreo");

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
            else return includes.views.customResponse(res, true, 200, "", v);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })

    },
    export: async (req, res) => {

    },
    modify: async (req, res) => {
        const { id } = req.params;

        if(!id || !req.body) return includes.views.error.message(res, "Error en los parametros enviados");

        monModel.modify(id, req.body).then(v => {
            if(!v) return includes.views.error.message(res, "Error al modificar el monitoreo");
            else return includes.views.success.update(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })

    },
    delete: async (req, res) => {
        
    }
}

module.exports = controller;