const express       = require('express');
const helper        = require('../controllers/helper')
const cfile         = helper.configFile();
const routesPath    = cfile.mainInfo.routes;
const app = express();


app.use('/', require('./main'));
app.use(`${routesPath}/users`,require('./users'));
app.use(`${routesPath}/files`,require('./files'));
app.use(`${routesPath}/roles`,require('./roles'));

module.exports = app;