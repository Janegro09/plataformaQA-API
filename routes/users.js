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


let router = express.Router();

router.post('/new',users.new);
router.post('/passchange/:id?',users.passchange);

router.route("/:id?")
            .get(users.get)
            .post(users.update)
            .delete(users.delete)
            .put( users.diabled);

module.exports = router;