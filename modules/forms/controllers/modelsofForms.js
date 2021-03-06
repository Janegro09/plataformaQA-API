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
const ModelsForms = require('../models/modelsofForms');


module.exports = {
    new: async (req, res) => {
        if(!req.body) return includes.views.error.message(res, "Error en los parametros enviados");

        let formModel = new ModelsForms(req.body);

        formModel.save().then(v => {
            if(!v) return includes.views.error.message(res, "Error al crear el modelo de formulario");
            else return includes.views.success.create(res);
        }).catch(e => {
            console.log('Error: ', e);
            return includes.views.error.message(res, e.message);
        })

    },
    get: async (req, res) => {
        const { id } = req.params;

        ModelsForms.get(id).then(v => {
            if(!v) return includes.views.error.message(res, "Error al obtener el modelo de formulario");
            else return includes.views.customResponse(res, true, 200, "", v);
        }).catch(e => {
            console.log('Error: ', e);
            return includes.views.error.message(res, e.message);
        })
    },
    modify: async (req, res) => {
        const { id } = req.params;
        if(!id) return includes.views.error.message(res, "ID no especificado");

        ModelsForms.modify(id, req.body).then(v => {
            if(!v) return includes.views.error.message(res, "Error al modificar el modelo de formulario");
            else return includes.views.success.update(res)
        }).catch(e => {
            console.log('Error: ', e);
            return includes.views.error.message(res, e.message);
        })

    },
    delete: async (req, res) => {
        const { id } = req.params;
        if(!id) return includes.views.error.message(res, "ID no especificado");

        ModelsForms.delete(id).then(v => {
            if(!v) return includes.views.error.message(res, "Error al modificar el modelo de formulario");
            else return includes.views.success.update(res)
        }).catch(e => {
            console.log('Error: ', e);
            return includes.views.error.message(res, e.message);
        })
    }
}
