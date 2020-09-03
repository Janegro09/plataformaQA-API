/**
 * @fileoverview Modulo Administrador de formularios
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

// Schemas
const helper = require('../helper');
const modelsofFromsTable = require('../migrations/modelsofFroms.table');
const customfieldsTable = require('../migrations/customfields.table');
const customfields = require('../models/customfields');

module.exports = class ModelsForms {
    constructor(data) {
        const { name, section, subsection, description, parts } = data;
        this.name           = name          || false;
        this.section        = section       || false;
        this.subsection     = subsection    || "";
        this.description    = description   || "";
        this.parts          = parts         || [];
    }

    async save() {
        const { name, section, subsection, description, parts } = this;
        if(!name || !section) throw new Error('Error en los parametros enviados');
        // Chequeamos quie el nombre no se haya utilizado
        let c = await modelsofFromsTable.find({ name });
        if(c.length > 0) throw new Error('Ya existe un modelo con ese nombre')

        // Vamos a checkear la seccion
        const authorizedSections = ["M", "P"];
        if(!authorizedSections.includes(section)) throw new Error('Error en el tipo de seccion, debe ser M o P');

        if(!parts || parts.length === 0) throw new Error('Error en las partes del formulario');

        let partsToSave = [];
        for(let { name, customFields } of parts) {
            if(!name) throw new Error('Debe definir los nombres en todas las partes del formulario');

            let part = {
                name,
                customFields: []
            }

            for(let cf of customFields) {

                if(!cf.question) throw new Error('Error en una pregunta, esta vacia o no envio parametros');

                let question = cf.question;

                let request = await customfieldsTable.find({ _id: cf.customField });
                if(!request) continue;

                part.customFields.push({
                    question,
                    customField: cf.customField
                });
            }
            partsToSave.push(part)
        }

        let form = new modelsofFromsTable({
            name,
            section,
            subsection,
            description,
            parts: partsToSave
        });

        c = await form.save();

        if(c) return true;
        else return false;
    }

    static async get(id) {
        let where = {}, returnData = [];

        if(id) {
            where._id = id;
        }

        let c = await modelsofFromsTable.find().where(where);

        for(let r of c) {
            // Vamos a hacer un request y traemos todos los custom fields
            let parts = r.parts.length;
            if(id) {
                parts = await ModelsForms.getParts(r.parts)
            }
            let td = {
                id: r._id,
                name: r.name,
                section: r.section,
                subsection: r.subsection,
                description: r.description,
                createdAt: r.createdAt,
                parts
            }


            returnData.push(td);
        }

        return returnData;


    }

    static async getParts(arrayOfParts) {
        console.log(arrayOfParts)
        let returnData = [];
        for(let { customFields, name } of arrayOfParts ) {
            let td = {
                name,
                customFields: []
            }

            for(let c of customFields) {
                let query = await customfields.get(c);
                td.customFields = [...td.customFields, ...query];
            }

            returnData.push(td);
        }
        return returnData;

    }

    static async modify(id, data) {
        if(!id || !data) throw new Error('Error en los parametros enviados');
        let dataToModify = {};

        for(let d in data) {
            if(d == '_id') continue;
            if(data[d]) {
                dataToModify[d] = data[d]
            }
        }

        // Chequeamos si existe el modelo
        let c = await modelsofFromsTable.find({ _id: id });
        if(c.length === 0) throw new Error('Modelo de formulario inexistente');

        if(dataToModify.parts) {
            let partsToSave = [];
            for(let { name, customFields } of dataToModify.parts) {
                if(!name) throw new Error('Debe definir los nombres en todas las partes del formulario');
    
                let part = {
                    name,
                    customFields: []
                }
    
                for(let cf of customFields) {

                    if(!cf.question) throw new Error('Error en una pregunta, esta vacia o no envio parametros');
    
                    let question = cf.question;
    
                    let request = await customfieldsTable.find({ _id: cf.customField });
                    if(!request) continue;
    
                    part.customFields.push({
                        question,
                        customField: cf.customField
                    });
                }
                partsToSave.push(part)
            }
            dataToModify.parts = partsToSave;
        }
        c = await modelsofFromsTable.updateOne({ _id: id }, dataToModify);

        if(c.ok) return true;
        else return false;
    }

    static async delete(id) {
        if(!id) throw new Error('Error al eliminar el modelo');

        // Chequeamos si existe el modelo
        let c = await modelsofFromsTable.find({ _id: id });
        if(c.length === 0) throw new Error('Modelo de formulario inexistente');

        c = await modelsofFromsTable.deleteOne({ _id: id });
        if(c.ok) return true;
        else return false;
    }
}