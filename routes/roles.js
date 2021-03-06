
/**
 * @fileoverview Routes | Rutas para roles
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

// Incluimos controladores, modelos, schemas y modulos
const express           = require('express');
const roles             = require('../controllers/roles');
let router = express.Router();
const permit            = require('../models/permissions');

/**
 * permit.checkPermit --> sirve para comprobar si el usuario tiene los permisos para acceder a ese request 
 */


router.route("/:id?")
            .get(permit.checkPermit, roles.get)
            .post(permit.checkPermit, roles.new)
            .delete(permit.checkPermit, roles.delete)
            .put( permit.checkPermit, roles.update);

module.exports = router;