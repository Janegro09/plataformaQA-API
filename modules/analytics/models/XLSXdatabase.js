/**
 * @fileoverview Modulo analytics | modelo para manejo de bases de datos con archivos XLSX
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
const xlsx     = require('node-xlsx');

// Schemas
const helper = require('../helper');

const XLSXdatabase = {
    fileData: [],
    async getFile(idFile) {
        // Traemos un archivo de analytics
        if(!idFile) return false;

    }
}


module.exports = XLSXdatabase;