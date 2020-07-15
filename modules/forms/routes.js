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

const controller = require('./controllers/customfields');


// Custom fields routes
const customFields = "/customfields";
router.get(`${customFields}/:id?`, includes.permit.checkPermit, controller.get);
router.post(`${customFields}/new`, includes.permit.checkPermit, controller.new);
router.put(`${customFields}/:id`, includes.permit.checkPermit, controller.update);
router.delete(`${customFields}/:id`, includes.permit.checkPermit, controller.delete);

// Forms routes

// In Questions routes

module.exports = router;