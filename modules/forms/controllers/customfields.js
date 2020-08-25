/**
 * @fileoverview Modulo forms
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

const customFieldsModel = require('../models/customfields');

module.exports = {
    get: async (req, res) => {
        const { id } = req.params;
        customFieldsModel.get(id).then(v => {
            if(!v) return includes.views.error.message(res, 'Error al mostrar los campos personalizados')
            else return includes.views.customResponse(res, true, 200, "", v);
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })

    },
    new: async (req, res) => {
        if(!req.body) return includes.views.error.message(res, 'Error en los parametros enviados')
        const { name, type, values, required, format, description, section, subsection, calibrable } = req.body;

        // Verificamos si se enviaron los campos requeridos
        const requiredValues = ['name', 'type', 'values', 'required', 'section'];
        const sendedValues = Object.keys(req.body)
        requiredValues.map(v => {
            if(!sendedValues.includes(v)){
                return includes.views.error.message(res, 'Error en los parametros enviados por Body, fijesé los requeridos en la documentacion de la API');
            }
        })

        let campo = new customFieldsModel({
            name,
            type,
            values,
            required,
            format,
            description,
            section,
            subsection,
            calibrable
        })
        campo.save().then(v => {
            if(!v) return includes.views.error.message(res, 'Error al guardar el campo personalizado')
            else return includes.views.success.create(res)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })

    },
    update: async (req, res) => {
        const { id } = req.params;
        if(!id) return includes.views.error.message(res, 'Error en los parametros enviados');
        
        let dataModify = {
            id
        };
        
        for(let i in req.body){
            if(req.body[i] !== undefined){
                dataModify[i] = req.body[i]
            }
        }
            
        try {    
            await customFieldsModel.get(id);
            
            let n = new customFieldsModel(dataModify);
            n = await n.update()
            if(!n) return includes.views.error.message(res, 'Error al modificar el campo personalizado')
            else return includes.views.success.update(res);

        } catch (e) {
            return includes.views.error.message(res, e.message)
        }
    },
    delete: async (req, res) => {
        const { id } = req.params;
        if(!id) return includes.views.error.message(res, 'Error en los parametros enviados');
        try {    
            await customFieldsModel.get(id);
        
            let n = await customFieldsModel.delete(id);
            if(!n) return includes.views.error.message(res, 'Error al eliminar el campo personalizado')
            else return includes.views.success.delete(res);

        } catch (e) {
            return includes.views.error.message(res, e.message)
        }

    }
}
