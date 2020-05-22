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


router.route("/:id?")
            .get(groups.get)
            .post(groups.new)
            .delete(groups.delete)
            .put( groups.update);

module.exports = router;