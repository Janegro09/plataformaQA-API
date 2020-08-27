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
        this.name           = name          || false;
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

            for(let _id of customFields) {
                let request = await customfieldsTable.find({ _id });
                if(!request) continue;

                part.customFields.push(_id);
            }
            partsToSave.push(part)
        }

        if(programId) { 
            let c = await Program.get(programId.toString(), true);
            if(c.length === 0) throw new Error('Programa inexistente');
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
        }

        if(formsView.length === 0) throw new Error('No existe ningun formulario');
        if(!formsView[0] === 'all') {
            where._id = id && formsView.includes(id) ? id : { $in: formsView };
        }
        let c = await FormsTable.find().where(where)

        let dataReturn = [];
        for(let { _id, name, programId, description, parts, createdAt } of c) {
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
        }

        return dataReturn
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
        if(c.length === 0) throw new Error('Modelo de formulario inexistente');

        if(dataToModify.parts) {
            let partsToSave = [];
            for(let { name, customFields } of dataToModify.parts) {
                if(!name) throw new Error('Debe definir los nombres en todas las partes del formulario');
    
                let part = {
                    name,
                    customFields: []
                }
    
                for(let _id of customFields) {
                    let request = await customfieldsTable.find({ _id });
                    if(!request) continue;
    
                    part.customFields.push(_id);
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
        if(c.length === 0) throw new Error('Modelo de formulario inexistente');

        c = await FormsTable.updateOne({ _id: id }, { deleted: true });
        if(c.ok) return true;
        else return false;
    }

}