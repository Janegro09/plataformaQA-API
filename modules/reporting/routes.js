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
const controller       = require('./controllers/reporting');

// ------------------------------------------ REPORTING ---------------------------------------------------------
// Perfilamiento Routes
router.post('/', controller.getReport);


module.exports = router;