/**
 * @fileoverview Archivo principal de la aplicacion
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
const bodyParser    = require('body-parser');
const migrations    = require('./database/migrations/migrations');
const dotenv        = require('dotenv').config();
const fileUpload    = require('express-fileupload');
const Auth          = require('./middlewares/authentication');
const cors          = require('cors');
const helper        = require('./controllers/helper');
const cfile         = helper.configFile();

global.baseUrl      = require('path').resolve(); // almacenamos la ruta absoluta

const app = express();
app.set('view engine','pug');

// Start Middlewares
app.use(bodyParser.urlencoded({
    extended: true
}));

// Incluimos los modulos --
try {
    require('./modules');
} catch (e) {
    console.log(e);
}

// Definimos los cors segun el envriorment
if(process.env.ENVRIORMENT == 'development'){
    app.use(cors()) // Permitimos todos los request sin importar providencia
}else {
    const whiteListURLS = cfile.whiteListCors; // Lista de URLs permitidas en producción, especificadas en el archivo de configuracion.

    let crs = function (req, callback) {
        var corsOptions;
        // if (whiteListURLS.indexOf(req.header('Origin')) !== -1) {
        if (whiteListURLS.indexOf(req.header('Origin')) !== -1) {
          corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
        } else {
          corsOptions = { origin: false } // disable CORS for this request
        }
        callback(null, corsOptions) // callback expects two parameters: error and options
    }
    app.use(cors(crs))
}

app.use(fileUpload()); // Permito la posibilidad de enviar archivos por formularios, si la desactivo, los formularios dejaran de ser form-data y sera xxx-form-data/urlencoded

/**
 * Checkeara token en todos los request menos en los especificados en config.json
 */
app.use(Auth.checkToken);

app.use(bodyParser.json());

migrations(); // Crea las migraciones

app.use(require('./middlewares/headers')); // Inicia el middleware de headers
// End Middlewares

// Routes
app.use(require('./routes/index')); // Rutas principales

module.exports = app;
