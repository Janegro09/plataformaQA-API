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
const FormsTable = require('../migrations/forms.table');
const customfieldsTable = require('../migrations/customfields.table');
const customfields = require('../models/customfields');
const programs     = require('../../programs/models/programs');
const Program = require('../../programs/models/programs');
const formsTable = require('../migrations/forms.table');

module.exports = class Forms {
    constructor(data) {
        const { name, programId, description, parts } = data;
        this.name           = name          || 'Not Used';
        this.description    = description   || "";
        this.programId      = programId     || false;
        this.parts          = parts         || [];
    }

    async save() {
        const { name, programId, description, parts } = this;

        if(!name || !programId) throw new Error('Error en los parametros enviados');

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

        if(programId) { 
            let c = await Program.get(programId.toString(), true);
            if(c.length === 0) throw new Error('Programa inexistente');

            // Consultamos si existe otro form
            c = await FormsTable.find({ programId, deleted: false });
            if(c.length > 0) throw new Error('No puede agregar otro formulario a un programa con formulario asignado');

        } else throw new Error('Programa no especificado');


        let form = new FormsTable({
            name,
            programId,
            description,
            parts: partsToSave
        });

        let c = await form.save();

        if(c) return true;
        else return false;
    }

    static async get(id, req = false) {
        let where = {
            deleted: false
        };
        if(id) {
            where._id = id;
        }

        let formsView = [];
        // Solo traemos las partituras disponibles por programa segun usuario
        if (req) {
            // comprobamos si es administrador
            let user = await includes.users.model.getUsersperGroup(req.authUser[0].id);
            if (user.indexOf('all') >= 0 || req.authUser[0].role.role === 'ADMINISTRATOR') {
                formsView = ['all'];
            } else {
                let programasPermitidos = await Program.get(req);
                for(let pp of programasPermitidos) {
                    if(!formsView.includes(pp.id)) {
                        formsView.push(pp.id)
                    }
                }
            }
        } else {
            formsView = ["all"];
        }

        if(formsView.length === 0) throw new Error('No existe ningun formulario');
        if(!formsView[0] === 'all') {
            where.programId = { $in: formsView };
        }
        let c = await FormsTable.find().where(where)
        let dataReturn = [];
        for(let { _id, name, programId, description, parts, createdAt } of c) {
            try {
                    
                if(id) {
                    parts = await Forms.getParts(parts)
                } else {
                    parts = parts.length;
                }
                let getProgram = await Program.get(programId, true)
                let tempdata = {
                    id: _id,
                    name,
                    description,
                    parts,
                    createdAt,
                    program: getProgram
                }
                dataReturn.push(tempdata);

            } catch (e) {
                continue;
            }
        }

        return dataReturn
    }

    static async getParts(arrayOfParts) {
        let returnData = [];
        for(let { customFields, name, _id } of arrayOfParts ) {
            let td = {
                id: _id,
                name,
                customFields: []
            }
            for(let c of customFields) {
                let query = await customfields.get(c.customField);
                td.customFields = [...td.customFields, {
                    question: c.question,
                    questionId: c._id,
                    ...query[0]
                }];
            }

            returnData.push(td);
        }
        return returnData;

    }

    /**
     * Esta funci??n buscara el formulario del programa especificado, y si no existe, bus
     * @param {String} programId 
     */
    static async getFormByProgram(programId) {
        if(!programId) throw new Error('ID de programa no especificado')

        const get_form = async (programId) => {
            if(!programId) return false;

            let c = await formsTable.find({ programId, deleted: false });
            if(c.length === 0) {
                // Si no existe formulario entonces buscamos el id del padre, y buscamos si el padre tiene form
                const { parentProgram } = await programs.get_parent_program(programId);
                if(!parentProgram) return false;

                return await get_form(parentProgram);
            }
            else return c[0];
        }

        let c = await get_form(programId);
        if(!c) throw new Error('Este programa ni sus parientes tienen un formulario asignado');

        const { _id } = c;

        c = await Forms.get(_id);
        if(c.length === 0) throw new Error('Formulario inexistente, error interno');

        return c[0];
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
        let c = await FormsTable.find({ _id: id, deleted: false });
        if(c.length === 0) throw new Error('Formulario inexistente');

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

        if(dataToModify.programId) { 
            let c = await Program.get(dataToModify.programId, true);
            if(c.length === 0) throw new Error('Programa inexistente');
        }

        c = await FormsTable.updateOne({ _id: id }, dataToModify);

        if(c.ok) return true;
        else return false;
    }

    static async delete(id) {
        if(!id) throw new Error('Error al eliminar el modelo');

        // Chequeamos si existe el modelo
        let c = await FormsTable.find({ _id: id , deleted: false});
        if(c.length === 0) throw new Error('Formulario inexistente');

        c = await FormsTable.updateOne({ _id: id }, { deleted: true });
        if(c.ok) return true;
        else return false;
    }

}