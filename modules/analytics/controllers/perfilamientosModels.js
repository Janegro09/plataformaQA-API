/**
 * @fileoverview Modulo Analytics
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

const perfilamientosModel = require('../models/perfilamientosModel');
const { views } = require('../../includes');

// Models
const controller = {
    new: async(req, res) => {
        // Creamos un nuevo modelo de cuartiles
        const { values, name } = req.body;
        if(!values || !name) return views.error.message(res, "Error en los parametros enviados");

        let modelo = new perfilamientosModel({ name, values });
        modelo.save().then(v => {
            if(!v) return views.error.message(res, "Error al guardar la platanilla");
            else return views.success.create(res);
        }).catch(e => {
            console.log('Err: ', e);
            return views.error.message(res, e.message);
        })
    },
    get: async (req, res) => {
        const {id} = req.params;
        // Obtenemos todas o algun modelo de cuartiles
        perfilamientosModel.get(id).then(v => {
            if(!v) return views.error.message(res, "Error al mostrar las platanillas");
            else return views.customResponse(res, true, 200, "Modelos de perfilamientos", v);
        }).catch(e => {
            console.log('Err: ', e);
            return views.error.message(res, e.message);
        })
    },
    modify: async (req, res) => {
        const { id } = req.params;
        const { values, name } = req.body;
        if(!id || !values || !name) return views.error.message(res, "Error en los parametros enviados");

        perfilamientosModel.modify(id, { values, name }).then(v => {
            if(!v) return views.error.message(res, "Error al modificar la platanilla");
            else return views.success.update(res);
        }).catch(e => {
            console.log('Err: ', e);
            return views.error.message(res, e.message);
        })
    },
    delete: async (req, res) => {
        const { id } = req.params;
        if(!id) return views.error.message(res, "Error en los parametros enviados");

        perfilamientosModel.delete(id).then(v => {
            if(!v) return views.error.message(res, "Error al modificar la platanilla");
            else return views.success.delete(res);
        }).catch(e => {
            console.log('Err: ', e);
            return views.error.message(res, e.message);
        })
    }
}

module.exports = controller