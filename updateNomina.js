/**
 * @fileoverview Script para actualizar la nomina automaticamente desde el servicio REST propuesto por teco
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

const fetch         = require('node-fetch');
const FormData      = require('form-data');
const nominaImport  = require('./controllers/backoffice');
const csvtojson     = require('csvtojson');
const mongoose      = require('mongoose');
const helper        = require('./controllers/helper');
const db            = require('./controllers/db');
const cfile         = helper.configFile();
const dbConfig      = db.getData();
mongoose.Promise    = global.Promise;

let nominaRequest = {
    url: "https://cablevisionfibertel.sharepoint.com/sites/DOTACIONCUSTOMERCAREYVENTAS/_api/web/GetFolderByServerRelativeUrl('Archivos/Hist%C3%B3ricos')/files('Nomina%20Diaria.csv')/$value",
    options: {
        method: "GET",
        headers: {
            Authorization: "Bearer "
        }
    }
}

module.exports = async function() {
    // ----------------------------------------------------------------------------------------------
    // Request 1 -- Solicitud de JWT 
    let formData = new FormData();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', '9ca91751-9bd3-4ecc-9af6-bed1baa67c5c@e0779def-eb91-4242-ae6a-f3962b1a1b5a');
    formData.append('client_secret', 'jaT+5sI4iDfhn+ZKEYTP1UEuXVnBDn6Ul+00JA31si4=');
    formData.append('resource', '00000003-0000-0ff1-ce00-000000000000/cablevisionfibertel.sharepoint.com@e0779def-eb91-4242-ae6a-f3962b1a1b5a');
    let tokenRequest = {
        url: "https://accounts.accesscontrol.windows.net/e0779def-eb91-4242-ae6a-f3962b1a1b5a/tokens/OAuth/2",
        options: {
            method: "POST",
            body: formData
        }
    }

    // Requerimos el token
    let request = await fetch(tokenRequest.url, tokenRequest.options);
    request = await request.json();
    if(request.error) return false;
    // Almacenamos el token
    nominaRequest.options.headers.Authorization += request.access_token;

    // ----------------------------------------------------------------------------------------------
    // Request 2 -- Solicitud de Nomina 
    request = await fetch(nominaRequest.url, nominaRequest.options);
    request = await request.text();

    csvtojson({})
    .fromString(request)
    .then((csvRow)=>{ 
        mongoose.connect(`mongodb://${dbConfig.mongodb.user}:${dbConfig.mongodb.password}@${dbConfig.mongodb.host}:${dbConfig.mongodb.port}/${dbConfig.mongodb.database}`,{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true }).then(() => {
            console.log("-------------------------------------------------- ");
            console.log("DATABASES CONNECTIONS");
            console.log("");
            console.log(`Conexion a MongoDB realizada correctamente mediante puerto: ${dbConfig.mongodb.port}`);
            nominaImport.import(csvRow).then(v => {
                process.exit();
                console.log(v)
            })
        }).catch(err => console.log(err))
    })
}();