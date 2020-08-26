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

    },
    modify: async (req, res) => {

    },
    delete: async (req, res) => {

    }
}
