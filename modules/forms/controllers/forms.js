/**
 * @fileoverview Modulo forms
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
const Forms = require('../models/forms');

module.exports = {
    new: async (req, res) => {
        if(!req.body) return includes.views.error.message(res, "Error en los parametros enviados");

        let formModel = new Forms(req.body);

        formModel.save().then(v => {
            if(!v) return includes.views.error.message(res, "Error al crear el formulario");
            else return includes.views.success.create(res);
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    },
    get: async (req, res) => {
        const { id } = req.params;

        Forms.get(id, req).then(v => {
            if(!v) return includes.views.error.message(res, "Error al mostrar los formularios");
            else return includes.views.customResponse(res, true, 200, "", v);
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    },
    modify: async (req, res) => {
        const { id } = req.params;
        if(!id) return includes.views.error.message(res, "ID no especificado");

        Forms.modify(id, req.body).then(v => {
            if(!v) return includes.views.error.message(res, "Error al modificar el modelo de formulario");
            else return includes.views.success.update(res)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    },
    delete: async (req, res) => {
        const { id } = req.params;
        if(!id) return includes.views.error.message(res, "ID no especificado");

        Forms.delete(id).then(v => {
            if(!v) return includes.views.error.message(res, "Error al modificar el modelo de formulario");
            else return includes.views.success.update(res)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    }
}
