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
        let message = "";
        if(req.params.id !== undefined && req.params.userId !== undefined && req.params.stepId !== undefined){
            message = "Step information"
        }else if(req.params.id !== undefined && req.params.userId !== undefined){
            message = "User partiture"
        }else if(req.params.id !== undefined){
            message = `Partiture ${req.params.id} detail`
        }else{
            message = "All partitures"
        }
        partituresModel.get(req.params).then(v => {
            if(!v) return includes.views.error.message(res, 'Error al mostrar registros')
            else return includes.views.customResponse(res, true, 200, message, v)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    },
    async delete(req, res) {
        if(!req.params.id) return includes.views.error.message(res, 'Error en los parametros enviados.');
        partituresModel.delete(req.params.id).then(v => {
            if(!v) return includes.views.error.message(res, 'Error al eliminar la partitura')
            else return includes.views.success.delete(res)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    },
    async update(req, res){

    }
}

module.exports = controller