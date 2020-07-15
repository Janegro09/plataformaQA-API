
/**
 * @fileoverview Routes | Rutas para files
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
const Files         = require('../controllers/files');
let router = express.Router();
// const permit            = require('../models/permissions');

/**
 * permit.checkPermit --> sirve para comprobar si el usuario tiene los permisos para acceder a ese request 
 */

router.get('/:id?', Files.getPublicFile);
router.post('/', Files.newFile);
router.delete('/:id', Files.deleteFile);

module.exports = router;