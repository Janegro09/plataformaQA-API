const express       = require('express');
const bodyParser    = require('body-parser');
const migrations    = require('./database/migrations/migrations');
const dotenv        = require('dotenv').config();
const fileUpload    = require('express-fileupload');
const Auth          = require('./middlewares/authentication');
const cors          = require('cors');

const app = express();
app.set('view engine','pug');

// Start Middlewares
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors())

app.use(fileUpload());

/**
 * Auth.checkToken -> validara el token y permisos de usuario para las rutas registradas en config.json,
 * si la ruta no existe entonces no solicitara ni token ni validara permiso.
 * "routesPermissions": { --> objeto principal config.json
        "/test": { --> la ruta test solicitara token y permisos de usuarios
            "GET": 1, --> para el metodo GET solicitara nivel de usuario <= 1
            "POST": 1, --> para el metodo POST solicitara nivel de usuario <= 1
            "PUT": 1, --> para el metodo PUT solicitara nivel de usuario <= 1
            "DELETE": 1 --> para el metodo DELETE solicitara nivel de usuario <= 1
        }
    }

 */
app.use(Auth.checkToken);
app.use(bodyParser.json());

migrations();

app.use(require('./middlewares/headers'));
// End Middlewares

// Routes
app.use(require('./routes/index'));

module.exports = app;