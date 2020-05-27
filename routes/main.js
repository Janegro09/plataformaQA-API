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
const backoffice    = require('../controllers/backoffice');
const cfile         = helper.configFile();
const routesPath    = cfile.mainInfo.routes;
const router        = express.Router();
const register      = require('./register.js');

router.get(`/`,main.principalView);
router.get(`${routesPath}/test`,main.test);
router.get(`${routesPath}/frontUtilities`, main.frontUtilities);
router.get(`${routesPath}/files/:section?/:type?/:file?`,main.getPublicFile);
router.post(`${routesPath}/login`, main.login);
router.post(`${routesPath}/backoffice/nomina`, backoffice.importNomina);

// register(router);

module.exports = router;