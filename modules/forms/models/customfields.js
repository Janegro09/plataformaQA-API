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

module.exports = class customFields {
    constructor(dataobject) {
        const { name, type, values, required, format, description, section, subsection } = dataobject;

        this.name           = name          || false;
        this.type           = type          || false;
        this.values         = values        || false;
        this.required       = required      ? true : false;
        this.format         = format        || false;
        this.description    = description   || false;
        this.section        = section       || false;
        this.subsection     = subsection    || false;
    }

    validarValores() {
        // Validamos el nombre
        if(!this.name || typeof this.name !== 'string') throw new Error('El tipo de dato en name debe ser string');

        const authorizedValuesofType = ['text', 'area', 'radio', 'checkbox', 'select'];
        if(this.type){
            if(!authorizedValuesofType.includes(this.type)) throw new Error('Debe ingresar solo types autorizados')
        }else throw new Error('El parametro type es requerido')

        if(this.type === 'radio' || this.type === 'checkbox' || this.type === 'select'){
            if(!this.values || typeof this.values !== 'object') throw new Error('El campo values es requerido para el tipo de campo ingresado y debe ser un array')
        }

        const authorizedValuesofSection = ['M', 'P']
        if(this.section){
            if(!authorizedValuesofSection.includes(this.section)) throw new Error('Debe ingresar solo los nombres de secciones autorizados');
        } else throw new Error('El parametro section es requerido')
    }

    async save() {
        this.validarValores();

        return true;
    }

    async update() {

    }
}