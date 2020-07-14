/**
 * @fileoverview Routes | Archivo principal de routes
 * Aqui se definen todas las rutas existentes en la app
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
const express       = require('express');
const helper        = require('../controllers/helper')
const cfile         = helper.configFile();
const routesPath    = cfile.mainInfo.routes;
const app = express();
const register      = require('./register.js');


app.use('/', require('./main')); // custom routes
app.use(`${routesPath}/users`,require('./users')); // Users routes
app.use(`${routesPath}/roles`,require('./roles')); // Roles routes
app.use(`${routesPath}/groups`,require('./groups')); // Users groups routes
app.use(`${routesPath}/permissions`,require('./permissions')); // Permissions routes
app.use(`${routesPath}/files`, require('./files'));

// Incluimos las rutas de los modulos
const modules = global.modules;
for(let x = 0; x < modules.length; x++){
    app.use(`${routesPath}/${modules[x].name}`, modules[x].requires.routes)
}

register(app) // Creamos cada ruta como un permiso, si esta especificada como not token en config.json entonces no la crea

module.exports = app;