/**
 * @fileoverview Routes | Rutas para groups
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
const express       = require('express');
const groups        = require('../controllers/groups');
let router          = express.Router();
const permit            = require('../models/permissions');
/**
 * permit.checkPermit --> sirve para comprobar si el usuario tiene los permisos para acceder a ese request 
 */

router.route("/:id?")
            .get(permit.checkPermit, groups.get)
            .post(permit.checkPermit, groups.new)
            .delete(permit.checkPermit, groups.delete)
            .put(permit.checkPermit, groups.update);

module.exports = router;