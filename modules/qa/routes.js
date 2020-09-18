/**
 * @fileoverview Modulo Programs
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
const includes      = require('../includes');
let router          = includes.express.Router();

// Controladores
const monController = require('./controllers/monitorings');
const calibrationsController = require('./controllers/calibrations');

const monRoute = '/monitoring'
router.post(`${monRoute}/new`,includes.permit.checkPermit ,monController.new);

router.get(`${monRoute}/exports`,includes.permit.checkPermit ,monController.export);
router.get(`${monRoute}/:id?`,includes.permit.checkPermit ,monController.get);

router.put(`${monRoute}/:id`,includes.permit.checkPermit ,monController.modify);
router.put(`${monRoute}/:id/file`,includes.permit.checkPermit ,monController.uploadFile);

router.delete(`${monRoute}/:id`,includes.permit.checkPermit ,monController.delete);
router.delete(`${monRoute}/:id/:file`,includes.permit.checkPermit ,monController.deleteFile);
// router.get('/')

const calibrationsTypesRoute = '/calibration/types'
router.get(`${calibrationsTypesRoute}`,includes.permit.checkPermit ,calibrationsController.getCalibrationType);
router.post(`${calibrationsTypesRoute}`,includes.permit.checkPermit ,calibrationsController.newCalibrationType);
router.delete(`${calibrationsTypesRoute}/:id`,includes.permit.checkPermit ,calibrationsController.deleteCalibrationType);

const calibrationsRoute = '/calibration'
router.post(`${calibrationsRoute}`,includes.permit.checkPermit ,calibrationsController.new);
router.get(`${calibrationsRoute}/:id?`,includes.permit.checkPermit ,calibrationsController.get);
router.put(`${calibrationsRoute}/:id`,includes.permit.checkPermit ,calibrationsController.modify);
router.delete(`${calibrationsRoute}/:id`,includes.permit.checkPermit ,calibrationsController.delete);


module.exports = router;