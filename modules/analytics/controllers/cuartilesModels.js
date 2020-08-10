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
const includes = require('../../includes');

const cuartilesModels = require('../models/cuartilesModels');

// Models
const controller = {
    new: async(req, res) => {
        // Creamos un nuevo modelo de cuartiles
    },
    get: async (req, res) => {
        // Obtenemos todas o algun modelo de cuartiles

    },
    delete: async (req, res) => {
        //eliminamos un modelo de cuartiles

    }
}

module.exports = controller