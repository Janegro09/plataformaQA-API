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

const cuartilesModels = require('../models/cuartilesModels');
const { views } = require('../../includes');

// Models
const controller = {
    new: async(req, res) => {
        // Creamos un nuevo modelo de cuartiles
        if(!req.body) return views.error.message(res, "Error en los parametros enviados");

        let modelo = new cuartilesModels(req.body);
        modelo.save().then(v => {
            if(!v) return views.error.message(res, "Error al guardar la platanilla");
            else return views.success.create(res);
        }).catch(e => {
            console.log('Err: ', e);
            return views.error.message(res, e.message);
        })
    },
    get: async (req, res) => {
        // Obtenemos todas o algun modelo de cuartiles
    },
    modify: async (req, res) => {

    }
}

module.exports = controller