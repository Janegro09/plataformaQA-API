/**
 * @fileoverview Modulo forms
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

const controllerCustomFields = require('./controllers/customfields');
const controllerForms        = require('./controllers/forms');
const controllerModelsForms  = require('./controllers/modelsofForms');

// Custom fields routes
const customFields = "/customfields";
router.get(`${customFields}/:id?`, controllerCustomFields.get);
router.post(`${customFields}/new`, includes.permit.checkPermit, controllerCustomFields.new);
router.put(`${customFields}/:id`, includes.permit.checkPermit, controllerCustomFields.update);
router.delete(`${customFields}/:id`, includes.permit.checkPermit, controllerCustomFields.delete);

const models = "/models";
router.get(`${models}/:id?`, includes.permit.checkPermit, controllerModelsForms.get);
router.post(`${models}/`, controllerModelsForms.new);
router.put(`${models}/:id`, includes.permit.checkPermit, controllerModelsForms.modify);
router.delete(`${models}/:id`, includes.permit.checkPermit, controllerModelsForms.delete);

// Forms routes
router.get('/:id?', controllerForms.get);
router.post('/', includes.permit.checkPermit, controllerForms.new);
router.put('/:id', includes.permit.checkPermit, controllerForms.modify);
router.delete('/:id', includes.permit.checkPermit, controllerForms.delete);
// Models of Forms routes

module.exports = router;
