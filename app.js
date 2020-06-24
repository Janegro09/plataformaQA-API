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

const app           = express();
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

if(process.env.ENVRIORMENT == 'development'){
    app.use(cors())
}else {
    const whiteListURLS = cfile.whiteListCors;
    let corsOptionsDelegate = function (req, callback) {
        var corsOptions;
        console.log(req.header('Origin'))
        if (whiteListURLS.indexOf(req.header('Origin')) !== -1) {
          corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
        } else {
          corsOptions = { origin: false } // disable CORS for this request
        }
        callback(null, corsOptions) // callback expects two parameters: error and options
    }
    app.use(function(req, res, next) {
        cors(corsOptionsDelegate);
        next();
    })
}

app.use(fileUpload());

/**
 * Checkeara token en todos los request menos en los especificados en config.json
 */
app.use(Auth.checkToken);
app.use(bodyParser.json());
migrations();
app.use(require('./middlewares/headers'));
// End Middlewares

// Routes
app.use(require('./routes/index'));

module.exports = app;
