/**
 * @fileoverview Routes | Rutas random y generales
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
const helper        = require('../controllers/helper')
const main          = require('../controllers/main');
const files         = require('../controllers/files');
const backoffice    = require('../controllers/backoffice');
const cfile         = helper.configFile();
const routesPath    = cfile.mainInfo.routes;
const router        = express.Router();

/**
 * permit.checkPermit --> sirve para comprobar si el usuario tiene los permisos para acceder a ese request 
 */


router.get(`/`,main.principalView);
router.get(`${routesPath}/test`,main.test);
router.get(`${routesPath}/frontUtilities`, main.frontUtilities);
router.post(`${routesPath}/login`, main.login);
router.get(`${routesPath}/downloadFile/:id`, files.getPublicFile);


module.exports = router;