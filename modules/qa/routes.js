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
router.post(`${monRoute}/`, monController.new);

router.get(`${monRoute}/exports`, monController.export);
router.get(`${monRoute}/:id?`, monController.get);

router.put(`${monRoute}/:id`, monController.modify);
router.put(`${monRoute}/:id/file`, monController.uploadFile);

router.delete(`${monRoute}/:id`, monController.delete);
router.delete(`${monRoute}/:id/:file`, monController.deleteFile);
// router.get('/')

const calibrationsTypesRoute = '/calibration/types'
router.get(`${calibrationsTypesRoute}`, calibrationsController.getCalibrationType);
router.post(`${calibrationsTypesRoute}`, calibrationsController.newCalibrationType);
router.delete(`${calibrationsTypesRoute}/:id`, calibrationsController.deleteCalibrationType);

const calibrationsRoute = '/calibration'
router.post(`${calibrationsRoute}`, calibrationsController.new);
router.get(`${calibrationsRoute}/:id?`, calibrationsController.get);
router.put(`${calibrationsRoute}/:id`, calibrationsController.modify);
router.delete(`${calibrationsRoute}/:id`, calibrationsController.delete);


module.exports = router;