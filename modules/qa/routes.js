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

const monRoute = '/monitoring'
router.post(`${monRoute}/`, monController.new);

router.get(`${monRoute}/exports`, monController.export);
router.get(`${monRoute}/:id?`, monController.get);

router.put(`${monRoute}/:id`, monController.modify);

router.delete(`${monRoute}/:id`, monController.delete);
// router.get('/')

module.exports = router;