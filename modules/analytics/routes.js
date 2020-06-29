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
const controllerPerfilamiento = require('./controllers/perfilamiento');
const controllerCuartiles     = require('./controllers/cuartiles');

// Perfilamiento Routes
router.get('/file/:id/columns', controllerPerfilamiento.getColumns);
router.post('/file',controllerPerfilamiento.new);
router.put('/file/:id', controllerPerfilamiento.assignProgram)
router.get('/file', controllerPerfilamiento.get);
router.get('/file/:id/download', controllerPerfilamiento.download);
router.delete('/file/:id', controllerPerfilamiento.delete);

// Cuartiles routes
router.post('/file/:fileId/cuartiles', controllerCuartiles.new)
router.get('/file/:fileId/cuartiles', controllerCuartiles.get);

// Grupos de perfilamientos
router.post('/file/:fileId/perfilamiento', controllerPerfilamiento.newGroup);
router.get('/file/:fileId/perfilamiento', controllerPerfilamiento.getGroups);

module.exports = router;