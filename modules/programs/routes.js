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

const controller = require('./controllers/programs');
const controllerGroups = require('./controllers/groups');

// Programs groups
const baseProgramsGroups = "/groups";
router.post(`${baseProgramsGroups}/new`, controllerGroups.create);
router.get(`${baseProgramsGroups}/:id?`, controllerGroups.get);
router.put(`${baseProgramsGroups}/:id?`, controllerGroups.modify);
router.delete(`${baseProgramsGroups}/:id?`, controllerGroups.delete);
router.delete(`${baseProgramsGroups}/:groupId/:userId`, controllerGroups.unassignUser);


// Programs
router.post('/new',controller.create);
router.route('/:id?')
                .get(controller.get)
                .put(controller.modify)
                .delete(controller.delete)

module.exports = router;