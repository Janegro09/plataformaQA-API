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


app.use('/', require('./main'));
app.use(`${routesPath}/users`,require('./users'));
app.use(`${routesPath}/roles`,require('./roles'));
app.use(`${routesPath}/groups`,require('./groups'));
app.use(`${routesPath}/permissions`,require('./permissions'));

// Incluimos las rutas de los modulos
const modules = global.modules;
for(let x = 0; x < modules.length; x++){
    app.use(`${routesPath}/${modules[x].name}`, modules[x].requires.routes)
}

register(app)

module.exports = app;