
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

router.route("/:id?")
            .get(roles.get)
            .post(roles.new)
            .delete(roles.delete)
            .put( roles.update);

module.exports = router;