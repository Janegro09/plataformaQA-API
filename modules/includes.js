/**
 * @fileoverview Almacenamos todos los includes necesarios para un modulo en una constante, y los modulos por defecto importan esta
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
const includes = {
    helper: require('../controllers/helper'),
    users: {
        model: require('../models/users'),
        schema: require('../database/migrations/usersTable')
    },
    express: require('express'),
    permit: require('../models/permissions'),
    views: require('../views'),
    XLSX: require('../models/XLSXFiles'),
    files: require('../controllers/files')

}

module.exports = includes;
