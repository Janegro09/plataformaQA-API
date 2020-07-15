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

    },
    new: async (req, res) => {
        if(!req.body) return includes.views.error.message(res, 'Error en los parametros enviados')
        const { name, type, values, required, format, description, section, subsection } = req.body;

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
            subsection
        })
        campo.save().then(v => {
            if(!v) return includes.views.error.message(res, 'Error al guardar el campo personalizado')
            else return includes.views.success.create(res)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })

    },
    update: async (req, res) => {

    },
    delete: async (req, res) => {
        
    }
}
