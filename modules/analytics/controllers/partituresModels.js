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
        partituresModels.get(req.params.id).then(v => {
            if(v.length === 0) return includes.views.error.message(res, 'No existen registros en nuestra base de datos');
            else return includes.views.customResponse(res, true, 200, "", v);
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    },
    async delete(req, res) {
        if(!req.params.id) return includes.views.error.message(res, 'Error en los parametros enviados')
        partituresModels.delete(req.params.id).then(v => {
            if(!v) return includes.views.error.message(res, 'Error al eliminar el modelo de partituras');
            else return includes.views.success.delete(res)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    },
    async update(req, res){
        if(!req.params.id) return includes.views.error.message(res, 'Error en los parametros enviados')
        
        if(!req.body.name || req.body.instances.length === 0) return includes.views.error.message(res, 'Parametros erroneos en el body, lea la documentacion.')

        let c = new partituresModels(req.body);

        c.create(req.params.id).then(v => {
            if(!v) return includes.views.error.message(res, 'Error al modificar el modelo de partituras');
            else return includes.views.success.update(res)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    }
}

module.exports = controller