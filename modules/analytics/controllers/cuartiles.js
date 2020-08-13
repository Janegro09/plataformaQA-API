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
            console.log(e)
            return includes.views.error.message(res, e.message);
        }) 
    },
    async get(req, res) {
        if(!req.params.fileId) return includes.views.error.code(res, 'ERR_09');
        let getUsers = false;
        if(req.query.getUsers){
            getUsers = req.query.getUsers == 'true' ? true : false;
        }
        model.getCuartiles(req.params.fileId, getUsers).then(v => {
            let message = "Modificacion de cuartiles"
            if(getUsers){
                message = "Obtencion de cuartiles para armado de grupos de cuartiles"
            }
            if(!v) return includes.views.error.message(res, "Error al obtener cuartiles");
            else return includes.views.customResponse(res, true, 200, message, v);
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    }
}

module.exports = controller