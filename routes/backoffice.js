
/**
 * @fileoverview Routes | Rutas para backoffice
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
const backoffice        = require('../controllers/backoffice');
let router              = express.Router();
const permit            = require('../models/permissions');

/**
 * permit.checkPermit --> sirve para comprobar si el usuario tiene los permisos para acceder a ese request 
 */

router.get('/nomina', permit.checkPermit ,backoffice.importNomina);
router.get('/home', backoffice.dashboard);
router.get('/exports/:section', backoffice.exports);

module.exports = router;