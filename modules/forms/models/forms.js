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
            console.log('checkeamos el programa');
            return true;
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

}