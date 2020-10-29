/**
 * @fileoverview Modulo QA
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
const Users = require('../../../models/users');
const { views } = require('../../includes');
const includes = require('../../includes');
const Program = require('../../programs/models/programs');

const monModel = require('../models/monitorings');

const controller = {
    /**
     * Funcion para crear un nuevo monitoreo,
     * recauda la informacion del programa y del usuario y crea un nuevo monitoreo
     */
    new: async (req, res) => {

        if(!req.body) return includes.views.error.message(res, "Error en los parametros enviados");
        try {
            let data = {
                ...req.body,
                createdBy: ""
            }

            // Especificamos el id del usuario que esta logeado
            if(req.authUser.length > 0) {
                data.createdBy = req.authUser[0].id;
            }

        
            let mon = new monModel(data);

            let save = await mon.save();
            if(!save) return includes.views.error.message(res, "Error al crear monitoreo");

            if(req.files) {
                let saveFile = await monModel.saveFile(save._id, req);
                if(!saveFile) return includes.views.error.message(res, "Error al guardar los archivos del monitoreo");
            }

            return includes.views.customResponse(res, true, 200, "Monitoreo creado exitosamente", save);
        } catch (e) {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        }

    },
    get: async (req, res) => {
        const { id } = req.params;

        monModel.get(id, req.query, req).then(v => {

            if(!v) return includes.views.error.message(res, "Error al obtener monitoreos");
            else if(v.length === 0) return includes.views.error.message(res, "No hay monitoreos para mostrar");
            else return includes.views.customResponse(res, true, 200, "", v);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })

    },
    export: async (req, res) => {
        const { monitoringsIds } = req.body;

        if(!monitoringsIds) return includes.views.error.message(res, "Error en los parametros enviados");

        try {
            let exp = await monModel.export(monitoringsIds);
            includes.files.getTempURL(exp.id, true).then(v => {
                if(!v) return includes.views.error.message(res, "Error al obtener los monitoreos");
                return includes.views.customResponse(res, true, 200, `Monitoring Exports cant: ${monitoringsIds.length}`, {
                    tempId: v
                });
            }).catch(e => {
                console.log('Err: ', e);
                return includes.views.error.message(res, e.message);
            })
        } catch (e) {
            console.log("Err: ", e);
            return includes.views.error.message(res, "Error al exportar monitoreos");
        }

    },
    modify: async (req, res) => {
        const { id } = req.params;

        if(!id || !req.body) return includes.views.error.message(res, "Error en los parametros enviados");

        let userId   = req.authUser[0].id        || false
        let userRole = req.authUser[0].role.role || false

        monModel.modify(id, req.body, {userId, userRole}).then(v => {
            if(!v) return includes.views.error.message(res, "Error al modificar el monitoreo");
            else return includes.views.success.update(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })

    },
    delete: async (req, res) => {
        const { id } = req.params;

        if(!id) return includes.views.error.message(res, "Error en los parametros enviados");

        let userId   = req.authUser[0].id        || false
        let userRole = req.authUser[0].role.role || false

        monModel.delete(id, {userId, userRole}).then(v => {
            if(!v) return includes.views.error.message(res, "Error al eliminar el monitoreo");
            else return includes.views.success.delete(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })
    },
    delete_never_used: async (req, res) => {
        const { id } = req.params;

        if(!id) return includes.views.error.message(res, "Error en los parametros enviados");

        monModel.delete_never_used(id).then(v => {
            if(!v) return includes.views.error.message(res, "Error al eliminar el monitoreo");
            else return includes.views.success.delete(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })

    },
    uploadFile: async (req, res) => {
        const { id } = req.params;

        if(!id || !req.files) return includes.views.error.message(res, "Error en los parametros enviados");

        try {
            let saveFile = await monModel.saveFile(id, req);
            if(!saveFile) return includes.views.error.message(res, "Error al guardar los archivos del monitoreo");

            return includes.views.success.create(res);
        } catch (e) {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        }

    },
    deleteFile: async (req, res) => {
        const { id, file } = req.params;

        if(!id || !file) return includes.views.error.message(res, "Error en los parametros enviados");

        monModel.deleteFile(id, file).then(v => {
            if(!v) return includes.views.error.message(res, "Error al eliminar el archivo");
            else return includes.views.success.delete(res);
        }).catch(e => {
            console.log('Err: ', e);
            return includes.views.error.message(res, e.message);
        })
    },
    get_search_filters: async (req, res) => {

        if(!req.body || req.body.length === 0 || !req.body instanceof Array) return views.error.message(res, "Error en los parametros enviados");

        let companies = [];

        // Filtramos las empresas solicitadas segun el usuario ue consulta
        let empresa_consulta = req.authUser[0].razonSocial || false;
        if(empresa_consulta) {
            // Si pregunta alguien de telecom mostramos todo lo que consulta
            if(empresa_consulta === 'TELECOM'){
                companies = req.body;
            } else{
                companies = [empresa_consulta]; // Si no es de TELECOM, solamente pregutaremos por su propia empresa
            }
        } else return views.error.message(res, "Error en la empresa de quien consulta")

        try {
            let returnData = {};
            let programs = await Program.get_programs_by_groups(companies);
            returnData.programs = [];
            for (let { _id:id, name, description, section } of programs){
                if(section !== 'M') continue;
                let td = {
                    id,
                    name,
                    description,
                    section
                }
                returnData.programs.push(td);
            }

            return views.customResponse(res, true, 200, "", returnData);
        } catch (e) {
            console.log('Err: ', e);
            return views.error.message(res, e.message);
        }



    }
}

module.exports = controller;