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
    constructor() {
        this.name           = "";
        this.type           = "";
        this.required       = "";
        this.format         = "";
        this.description    = "";
        this.section        = "";
        this.subsection     = "";
    }

    validarValores() {
        
    }

    async save() {

    }

    async update() {

    }
}