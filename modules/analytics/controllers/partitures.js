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
const { views } = require('../../includes');

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
            console.error(e)
            return includes.views.error.message(res, e.message);
        })
    },
    /**
     * Funcion que devuelve los datos de una partitura, necesarios para la reporteria
     * @param {Object} req 
      @param {Object} res 
     */
    async getPartitureInfo(req, res) {
        const { id } = req.params;

        if(!id) return includes.views.error.message(res, "Error en los parametros enviados");

        partituresModel.getPartitureInfo(id).then(v => {
            if(!v) return includes.views.error.message(res, 'Error al mostrar los datos de la partitura')
            else return includes.views.customResponse(res, true, 200, "", v)
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
        partituresModel.get(req).then(v => {
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
        if(!req.params.id || !req.params.userId || !req.body) return includes.views.error.message(res, 'Error en los parametros enviados.');
        let message = "Modify steps to user"
        let modifyData = [];
        let tempData;
        let data = {
            id: req.params.id,
            userId: req.params.userId,
            body: req.body
        }
        if(req.params.stepId){
            message = "Modify step info"
            data.stepId = req.params.stepId;

            let tempModData = {}
            // Verificamos que esten las steps
            for(let i in data.body){
                if(i === 'completed') continue; // Ignoramos columnas
                if(data.body[i]){
                    tempModData[i] = data.body[i]
                }
            }

            // Cambiamos el estado de la partitura por usuario, si mejora o no
            // if(data.body.improvment) {

            // }

            tempData = {
                id: data.id,
                userId: data.userId,
                stepId: data.stepId,
                modify: tempModData,
                userLogged: req.authUser[0]
            }

            modifyData.push(tempData);

        }else {
            if(data.body.length === 0) return includes.views.error.message(res, 'Body vacio.');
            // Editamos los status
            tempData = {
                id: data.id,
                userId: data.userId,
                stepId: "",
                modify: {},
                userLogged: req.authUser[0]
            }
            data.body.map(v => {
                tempData.stepId = v.stepId;
                tempData.modify.completed = v.completed
            })

            modifyData.push(tempData);
        }


        
        // Verificamos el body
        partituresModel.modifySteps(modifyData).then(v => {
                if(!v) return includes.views.error.message(res, 'Error al modificar los steps')
                else return includes.views.success.update(res)
            }).catch(e => {
                return includes.views.error.message(res, e.message);
            })

    },
    async deleteFile(req, res) {
        if(!req.params.id || !req.params.fileId) return includes.views.error.message(res, 'Error en los parametros enviados.')
        partituresModel.deleteAudioFiles([req.params.fileId]).then(v => {
            if(!v) return includes.views.error.message(res, 'Archivo inexistente')
            else return includes.views.success.delete(res)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })


    },
    async changePartitureStatus(req, res){
        /**
         * Esta funcion queda obsoleta ya que requieren que el estado cambie automaticamente cuando se cambiaron todos los campos del lado del usuario
         */
        // if(!req.params.id || !req.params.userId || !req.query.status) return includes.views.error.message(res, 'Error en los parametros enviados.')
        // partituresModel.changePartitureStatus(req.params.id, req.params.userId, req.query.status).then(v => {
        //     if(!v) return includes.views.error.message(res, 'Error al modificar el estado de la partitura')
        //     else return includes.views.success.update(res)
        // }).catch(e => {
        //     return includes.views.error.message(res, e.message);
        // })
    },
    async uploadFile(req, res) {
        if(!req.query || (!req.files && !req.body.message)|| !req.params.id || !req.params.userId || !req.params.stepId) return includes.views.error.message(res, 'Error en los parametros enviados.')
        const acceptedSections = ['monitorings', 'coachings'];
        if(!acceptedSections.includes(req.query.section)) return includes.views.error.message(res, 'Error en los parametros enviados.')
        const { stepId, userId, id }    = req.params;
        const { section }               = req.query;
        const { message }               = req.body;
        let tempData = {
            stepId,
            userId,
            id,
            section
        }

        if(req.files){
            // const file = req.files.file;
            let f = new includes.files(req);
            f = await f.save();
            if(f){
                tempData.file = f.id;
            }
        } else if(message) {
            tempData.message = message;
        }

        partituresModel.uploadFile(tempData).then(v => {
            if(!v) return includes.views.error.message(res, 'Error al subir el archivo')
            else return includes.views.success.update(res)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    },
    async downloadFile(req, res) {
        const { id, userId, stepId, fileId } = req.params;
        if(!id || !userId || !stepId || !fileId) return includes.views.error.code(res, 'ERR_09'); 

        partituresModel.getFileId(id, userId, stepId, fileId).then(v => {
            if(!v) return includes.views.error.message(res, 'Error al descargar el archivo')
            else return includes.views.customResponse(res, true, 200, "", v);
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
        
    }
}

module.exports = controller