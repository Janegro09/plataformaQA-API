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
const controllerPerfilamiento       = require('./controllers/perfilamiento');
const controllerCuartiles           = require('./controllers/cuartiles');
const controllerPartitures          = require('./controllers/partitures');
const controllerPartituresModels    = require('./controllers/partituresModels');

// ------------------------------------------ PERFILAMIENTO ---------------------------------------------------------
// Perfilamiento Routes
router.get('/file/:id/columns',includes.permit.checkPermit, controllerPerfilamiento.getColumns);
router.post('/file',includes.permit.checkPermit,controllerPerfilamiento.new);
router.put('/file/:id',includes.permit.checkPermit, controllerPerfilamiento.assignProgram)
router.get('/file', includes.permit.checkPermit, controllerPerfilamiento.get);
router.get('/file/:id/download',includes.permit.checkPermit, controllerPerfilamiento.download);
router.delete('/file/:id', includes.permit.checkPermit, controllerPerfilamiento.delete);

// Cuartiles routes
router.post('/file/:fileId/cuartiles',includes.permit.checkPermit, controllerCuartiles.new)
router.get('/file/:fileId/cuartiles',includes.permit.checkPermit, controllerCuartiles.get);

// Grupos de perfilamientos
router.post('/file/:fileId/perfilamiento',includes.permit.checkPermit, controllerPerfilamiento.newGroup);
router.get('/file/:fileId/perfilamiento',includes.permit.checkPermit, controllerPerfilamiento.getGroups);


// ------------------------------------------ PARTITURAS -----------------------------------------------------------

// Partitures
router.post('/partitures/new',includes.permit.checkPermit, controllerPartitures.new);
router.get('/partitures/:id?/:userId?/:stepId?',includes.permit.checkPermit, controllerPartitures.get);
router.delete('/partitures/:id',includes.permit.checkPermit, controllerPartitures.delete);
router.put('/partitures/:id?/:userId?/:stepId?',includes.permit.checkPermit, controllerPartitures.update);
router.post('/partitures/:id/:userId', includes.permit.checkPermit, controllerPartitures.changePartitureStatus)
router.post('/partitures/:id/:userId/:stepId/files',controllerPartitures.uploadFile)

// Audio files
router.delete('/partitures/:id/:fileId', controllerPartitures.deleteFile);

// Partitures Models
router.post('/partituresModels/new',includes.permit.checkPermit, controllerPartituresModels.new)
router.put('/partituresModels/:id',includes.permit.checkPermit, controllerPartituresModels.update);
router.get('/partituresModels/:id?',includes.permit.checkPermit, controllerPartituresModels.get);
router.delete('/partituresModels/:id',includes.permit.checkPermit, controllerPartituresModels.delete);



module.exports = router;