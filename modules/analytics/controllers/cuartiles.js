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

const programsSchema = require('../../programs/migrations/programs.table');

// Models
const model = require('../models/cuartiles');
const controller = {
    async new(req, res) {
        if(!req.params.fileId || !req.body.length > 0) return includes.views.error.code(res, 'ERR_09');
        model.modify(req.params.fileId, req.body).then(v => {
            if(!v) return includes.views.error.message(res, "Error al crear cuartiles");
            else return includes.views.success.create(res)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        }) 
    },
    async get(req, res) {

    }
}

module.exports = controller