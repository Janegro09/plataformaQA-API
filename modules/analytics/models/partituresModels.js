/**
 * @fileoverview Modulo analytics | Modelo para partituras
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

const XLSXdatabase  = require('./XLSXdatabase');

const cuartilesGroupsModel = require('./cuartilesGroups');

// Schemas
const partituresModelSchema = require('../migrations/parituresModels.table');
const parituresModelsTable = require('../migrations/parituresModels.table');

class PartituresModels {
    constructor(object){
        this.name = object.name || false;
        this.instances = object.instances || false;

    }

    async create(){
        // verificamos que este la data
        if(!this.name || !this.instances) throw new Error('Error en los parametros enviados');

        let tempData = {
            name: this.name,
            instances: []
        }

        // Analizamos que las instancias tengan todos los datos
        for(let i = 0; i < this.instances.length; i++){
            const inst = this.instances[i];

            if(!inst.name || inst.steps.length === 0) throw new Error('Error en los parametros enviados')

            for(let o = 0; o < inst.steps.length; o++){
                const step = inst.steps[o];
                if(!step.name || !step.requiredMonitorings) throw new Error('Error en los parametros enviados')
            }
            tempData.instances.push(inst);
        }

        try {
            // Buscamos que no exista otro registro con el mismo nombre
            let c = await partituresModelSchema.find({name: tempData.name});
            if(c.length > 0) throw new Error('Partitura existente')

            c = new partituresModelSchema(tempData);
            c = await c.save();
            if(c) return true;
            else return false;
        }catch (e) {
            throw e
        }
    }
}

module.exports = PartituresModels;