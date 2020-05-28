/**
 * @fileoverview Routes | Rutas para usuarios
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
const users             = require('../controllers/users');
const permit            = require('../models/permissions');
/**
 * permit.checkPermit --> sirve para comprobar si el usuario tiene los permisos para acceder a ese request 
 */


let router = express.Router();

router.post('/new',permit.checkPermit,users.new);
router.post('/passchange/:id?',permit.checkPermit,users.passchange);

router.route("/:id?")
            .get(permit.checkPermit,users.get)
            .post(permit.checkPermit,users.update)
            .delete(permit.checkPermit,users.delete)
            .put(permit.checkPermit,users.diabled);

module.exports = router;