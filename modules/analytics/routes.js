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
const controllerCuartilesModels     = require('./controllers/cuartilesModels');
const controllerPerfilamientosModels     = require('./controllers/perfilamientosModels');

// ------------------------------------------ PERFILAMIENTO ---------------------------------------------------------
// Perfilamiento Routes
router.get('/file', includes.permit.checkPermit, controllerPerfilamiento.get);
router.get('/file/:id/columns', controllerPerfilamiento.getColumns);
router.get('/file/:id/download', controllerPerfilamiento.download);
router.post('/file/:id/online', controllerPerfilamiento.getOnline);
router.post('/file',includes.permit.checkPermit,controllerPerfilamiento.new);
router.post('/file/:id/mediana', controllerPerfilamiento.getMediana);
router.put('/file/:id',includes.permit.checkPermit, controllerPerfilamiento.assignProgram)
router.delete('/file/:id', includes.permit.checkPermit, controllerPerfilamiento.delete);

// Cuartiles routes
router.post('/file/:fileId/cuartiles',includes.permit.checkPermit, controllerCuartiles.new)
router.get('/file/:fileId/cuartiles', controllerCuartiles.get);

// Grupos de perfilamientos
router.post('/file/:fileId/perfilamiento',includes.permit.checkPermit, controllerPerfilamiento.newGroup);
router.get('/file/:fileId/perfilamiento', controllerPerfilamiento.getGroups);


// ------------------------------------------ PARTITURAS -----------------------------------------------------------

// Partitures
router.post('/partitures/new',includes.permit.checkPermit, controllerPartitures.new);
router.get('/partitures/dataReporting/:id?', controllerPartitures.getPartitureInfo);
router.get('/partitures/:id?/:userId?/:stepId?', includes.permit.checkPermit, controllerPartitures.get);
router.delete('/partitures/:id',includes.permit.checkPermit, controllerPartitures.delete);
router.put('/partitures/:id?/:userId?/:stepId?',includes.permit.checkPermit, controllerPartitures.update);
router.post('/partitures/:id/:userId', includes.permit.checkPermit, controllerPartitures.changePartitureStatus)
router.post('/partitures/:id/:userId/:stepId/files',controllerPartitures.uploadFile)
router.get('/partitures/:id/:userId/:stepId/:fileId',controllerPartitures.downloadFile);

// Audio files
router.delete('/partitures/:id/:fileId', controllerPartitures.deleteFile);

// Partitures Models
router.post('/partituresModels/new',includes.permit.checkPermit, controllerPartituresModels.new)
router.put('/partituresModels/:id',includes.permit.checkPermit, controllerPartituresModels.update);
router.get('/partituresModels/:id?',includes.permit.checkPermit, controllerPartituresModels.get);
router.delete('/partituresModels/:id',includes.permit.checkPermit, controllerPartituresModels.delete);

// Cuartiles models
router.post('/cuartilesModels', controllerCuartilesModels.new);
router.get('/cuartilesModels/:id?', controllerCuartilesModels.get);
router.put('/cuartilesModels/:id', controllerCuartilesModels.modify);
router.delete('/cuartilesModels/:id', controllerCuartilesModels.delete);

// Perfilamientos models
router.post('/perfilamientosModel', controllerPerfilamientosModels.new);
router.get('/perfilamientosModel/:id?', controllerPerfilamientosModels.get);
router.put('/perfilamientosModel/:id', controllerPerfilamientosModels.modify);
router.delete('/perfilamientosModel/:id', controllerPerfilamientosModels.delete);


module.exports = router;