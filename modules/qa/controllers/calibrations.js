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

const calibrationsModel = require('../models/calibrations');
const calTypesModel     = require('../models/calibrationsTypes');

const controller = {
    new: async (req, res) => {
        // Funcion para crear una nueva sesion de calibracion
        if(!req.body) return includes.views.error.message(res, "Error en los parametros enviados");

        let calibrationSession = new calibrationsModel(req.body);

        calibrationSession.save().then(v => {
            if(!v) return includes.views.error.message(res, "Error al crear la sesion de calibracion");
            return includes.views.success.create(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })

    },
    get: async (req, res) => {
        // Funcion para obtener todas las sesiones de calibracion, si especifica ID trae data para editar y para visualizar resultados
        const { id } = req.params;

        calibrationsModel.get(id).then(v => {
            if(!v) return includes.views.error.message(res, "Error al obtener las sesiones de calibracion");
            else if(v.length === 0)return includes.views.error.message(res, "No hay registros para mostrar");
            return includes.views.customResponse(res, true, 200, "",  v);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })
    },
    modify: async (req, res) => {
        // Funcion para modificar la sesion de calibracion

        const { id } = req.params;

        if(!id || !req.body) return includes.views.error.message(res, "Error en los parametros enviados");

        calibrationsModel.modify(id, req.body).then(v => {
            if(!v) return includes.views.error.message(res, "Error al modificar la sesion de calibracion");
            return includes.views.success.update(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })


    },
    delete: async (req, res) => {
        // Funcion para eliminar calibraciones

        const { id } = req.params;

        if(!id) return includes.views.error.message(res, "Error en los parametros enviados");

        calibrationsModel.delete(id).then(v => {
            if(!v) return includes.views.error.message(res, "Error al eliminar la sesion de calibracion");
            return includes.views.success.delete(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })

    },
    newCalibrationType: async (req, res) => {
        // Funcion para agregar un tipo de calibracion
        if(!req.body) return includes.views.error.message(res, "Error en los parametros enviados");

        let tipo = new calTypesModel(req.body);
        
        tipo.save().then(v => {
            if(!v) return includes.views.error.message(res, "Error al crear el tipo de calibracion");
            return includes.views.success.create(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })
    },
    deleteCalibrationType: async (req, res) => {
        // Funcion para eliminar un tipo de calibracion si no tiene ninguna calibracion asignada
        const { id } = req.params;

        if(!id) return includes.views.error.message(res, "Error en los parametros enviados");

        calTypesModel.delete(id).then(v => {
            if(!v) return includes.views.error.message(res, "Error al eliminar el tipo de calibracion");
            return includes.views.success.delete(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })
    },
    getCalibrationType: async (req, res) => {  
        // Funcion para obtener todos los tipos de calibraciones
        calTypesModel.get().then(v => {
            if(!v) return includes.views.error.message(res, "Error al mostrar los tipos de calibraciones");
            return includes.views.customResponse(res, true, 200, "", v);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })
    }
}

module.exports = controller;