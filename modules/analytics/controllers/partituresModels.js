/**
 * @fileoverview Modulo Analytics | Modelos de partituras - repositorio de partituras
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

const partituresModels = require('../models/partituresModels');

const controller = {
    async new(req, res){
        if(!req.body) return includes.views.error.message(res, 'Error en los parametros enviados')

        // Verificamos que esten los datos requeridos
        if(!req.body.name || req.body.instances.length === 0) return includes.views.error.message(res, 'Parametros erroneos en el body, lea la documentacion.')

        let c = new partituresModels(req.body);

        c.create().then(v => {
            if(!v) return includes.views.error.message(res, 'Error al cerar el modelo de partitura');
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