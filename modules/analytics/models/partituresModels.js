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

    verifyInstances() {
        let instances = [];
        // Analizamos que las instancias tengan todos los datos
        for(let i = 0; i < this.instances.length; i++){
            const inst = this.instances[i];

            if(!inst.name || inst.steps.length === 0) throw new Error('Error en los parametros enviados')

            for(let o = 0; o < inst.steps.length; o++){
                const step = inst.steps[o];
                if(!step.name || !step.requiredMonitorings) throw new Error('Error en los parametros enviados')
            }
            instances.push(inst);
        }

        return instances;
    }

    async create(id = false){
        // verificamos que este la data
        if(!this.name || !this.instances) throw new Error('Error en los parametros enviados');

        let tempData = {
            name: this.name,
            instances: this.verifyInstances()
        }

        try {
            if(!id){
                // Buscamos que no exista otro registro con el mismo nombre
                let c = await partituresModelSchema.find({name: tempData.name});
                if(c.length > 0) throw new Error('Partitura existente')
    
                c = new partituresModelSchema(tempData);
                c = await c.save();
                if(c) return true;
                else return false;
            }else {
                let c = await partituresModelSchema.find({_id: id});
                if(c.length === 0) throw new Error('Partitura inexistente')

                c = await partituresModelSchema.updateOne({_id: id}, tempData);
                if(c.ok > 0) return true;
                else return false;
            }
        }catch (e) {
            throw e
        }
    }

    static async get(id){
        let returnData = []
        let where = {};
        if(id){
            where = {_id: id}
        }

        let c = await partituresModelSchema.find().where(where);
        
        for(let i = 0; i < c.length; i++){
            const m = c[i];

            let tempData = {
                id: m._id,
                name: m.name,
                instances: m.instances,
                createdAt: m.createdAt
            }
            returnData.push(tempData)
        }


        return returnData;
    }

    static async delete(id) {
        if(!id) throw new Error('Id no especificado')
        
        // Chequeamos si existe
        let c = await partituresModelSchema.find({_id: id});
        if(c.length === 0) throw new Error('Registro inexistente')

        c = await partituresModelSchema.deleteOne({_id: id});
        if(c.ok > 0) return true;
        else return false;
    }

    
}

module.exports = PartituresModels;