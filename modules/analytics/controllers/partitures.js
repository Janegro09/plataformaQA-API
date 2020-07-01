/**
 * @fileoverview Modulo Analytics | Partituras
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

const partituresModel = require('../models/partitures');

const controller = {
    async new(req, res){
        if(!req.body) return includes.views.error.message(res, 'Error en los parametros enviados');

        // Verificamos que esten los datos necesarios
        const requiredFields = ["fileId", "perfilamientosAsignados", "instances"]

        for(let r = 0; r < requiredFields.length; r++){
            if(!req.body[requiredFields[r]]) return includes.views.error.message(res, 'Error en los parametros enviados, por favor lea la documentacion')
        }

        let partiture = new partituresModel(req.body);
        partiture.create().then(v => {
            if(!v) return includes.views.error.message(res, 'Error al crear la partitura')
            else return includes.views.success.create(res)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    },
    async get(req, res){

    },
    async delete(req, res) {

    },
    async update(req, res){

    }
}

module.exports = controller