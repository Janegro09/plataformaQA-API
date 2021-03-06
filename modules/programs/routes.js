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
router.post(`${baseProgramsGroups}/new`, includes.permit.checkPermit , controllerGroups.create);
router.get(`${baseProgramsGroups}/:id?`, controllerGroups.get);
router.put(`${baseProgramsGroups}/:id?`, includes.permit.checkPermit , controllerGroups.modify);
router.delete(`${baseProgramsGroups}/:id?`, includes.permit.checkPermit , controllerGroups.delete);
router.delete(`${baseProgramsGroups}/:groupId/:userId`, includes.permit.checkPermit , controllerGroups.unassignUser);


// Programs
router.post('/new', includes.permit.checkPermit , controller.create);
router.delete('/:programId/:groupId',includes.permit.checkPermit ,controller.unassignGroup);
router.route('/:id?')
                .get(includes.permit.checkPermit,controller.get)
                .put(includes.permit.checkPermit,controller.modify)
                .delete(includes.permit.checkPermit,controller.delete)

module.exports = router;