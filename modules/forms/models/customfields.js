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
const customFieldsSchema = require('../migrations/customfields.table');
const customfields = require('../controllers/customfields');

module.exports = class customFields {
    constructor(dataobject) {
        const { id, name, type, values, required, format, description, section, subsection, calibrable } = dataobject;
        this.id             = id            || false;
        this.name           = name          || false;
        this.type           = type          || false;
        this.values         = values        || false;
        this.required       = required;
        this.format         = format        || false;
        this.description    = description   || false;
        this.section        = section       || false;
        this.subsection     = subsection    || false;
        this.calibrable     = calibrable    || false;
    }

    validarValores() {
        // Validamos el nombre
        if(this.name){
            if(typeof this.name !== 'string') throw new Error('El tipo de dato en name debe ser string');
        } else if(!this.id) throw new Error('error en los parametros enviados')

        const authorizedValuesofType = ['text', 'area', 'radio', 'checkbox', 'select'];
        if(this.type){
            if(!authorizedValuesofType.includes(this.type)) throw new Error('Debe ingresar solo types autorizados')
        }else if(!this.id) throw new Error('El parametro type es requerido')

        if(!this.id){
            if(this.type === 'radio' || this.type === 'checkbox' || this.type === 'select'){
                if(!this.values || typeof this.values !== 'object') throw new Error('El campo values es requerido para el tipo de campo ingresado y debe ser un array')
            }else {
                this.values = false;
            }
        }

        const authorizedValuesofSection = ['M', 'P']
        if(this.section){
            if(!authorizedValuesofSection.includes(this.section)) throw new Error('Debe ingresar solo los nombres de secciones autorizados');
        } else if(!this.id) throw new Error('El parametro section es requerido')

        let required;
        if(!this.id){
            required = this.required ? true : false;
        }else {
            required = this.required;
        }

        let dataReturn = {
            required
        };
        for(let i in this){
            if(i === 'required' || i === 'id') continue;
            if(this[i] !== false){
                dataReturn[i] = this[i]
            }
        }

        return dataReturn;
    }

    async save() {
        const data = this.validarValores();

        let d = new customFieldsSchema(data)
        try {
            let c = await d.save()
            if(c) return true;
            else return false;
        } catch(e) {
            throw e
        }
    }

    async update() {
        let data = this.validarValores();

        const { id } = this;

        if(!id) throw new Error('Id no enviado');

        let c = await customFieldsSchema.updateOne({_id: id}, data);
        if(c.ok > 0) return true;
        else return false;
    }

    static async get(id){
        let where = {}
        let returnData = [];
        if(id) {
            where = {_id: id}
        }
        let query = await customFieldsSchema.find().where(where);
        if(query.length === 0) throw new Error('No existen registros en nuestra base de datos');

        for(let cf of query){
            let values = await customFields.getValues(cf.values);

            let tempData = {
                id: cf._id,
                name: cf.name,
                type: cf.type,
                values,
                required: cf.required,
                format: cf.format,
                description: cf.description,
                section: cf.section,
                subsection: cf.subsection,
                createdAt: cf.createdAt
            }
            returnData.push(tempData);
        }

        return returnData;
    }

    static async getValues(values) {
        let returnData = [];
        for(let v of values) {
            let { value, customFieldsSync } = v;

            value = value || v;

            /**
             * Si v es un string entonces lo ponemos dentro del objeto value ya que cuando desarrollamos perfilamientos el array solo contenia string 
             * y ahora como hubo un cambio de estructura necesitamos convertirlos sin eliminarlos de la base
             */
            if(value) {
                if(customFieldsSync) {
                    customFieldsSync = await customFields.get(customFieldsSync)
                }
                let td = {
                    value,
                    customFieldsSync
                }
    
                returnData.push(td);
            }
        }

        return returnData;
    }

    static async delete(id) {
        if(!id) throw new Error('Error en los parametros enviados');

        let c = await customFieldsSchema.deleteOne({_id: id});
        if(c.ok > 0 && c.deletedCount > 0) return true;
        else return false;
    }
}