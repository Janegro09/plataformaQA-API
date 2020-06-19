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


global.baseUrl     = require('path').resolve();

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

app.use(cors())
app.use(fileUpload());

const XLSXFile = require('./models/XLSXFiles');
const exampleFile = new XLSXFile.XLSXFile('Datos');
const exampleSheet = new XLSXFile.Sheet(exampleFile, "Numeros");
//Agrego columnas
exampleSheet.addHeaders(["Nombre", "Apellido", "Telefono", "Mail"])
//Agrego filas 
for(let i = 0; i < 100; i++) {
    exampleSheet.addRow({
        Nombre: "Ramiro",
        Apellido: "Macciuci",
        Telefono: 1121742416,
        Mail: "ramimacciuci@gmail.com"
    })
}
exampleSheet.createSheet();
exampleFile.save().then(v => {
    console.log(v)
})

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
