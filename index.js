/**
 * @fileoverview Archivo de entrada principal, conexion principal a express y bases de datos
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
const app       = require('./app');
const mongoose  = require('mongoose');
const helper    = require('./controllers/helper');
const db        = require('./controllers/db');
const cfile     = helper.configFile();
const dbConfig  = db.getData();
mongoose.Promise= global.Promise;

const port = process.env.PORT || cfile.mainInfo.port;

// Realizamos las conexiones a la base de datos e iniciamos expressS

mongoose.connect(`mongodb://${dbConfig.mongodb.user}:${dbConfig.mongodb.password}@${dbConfig.mongodb.host}:${dbConfig.mongodb.port}/${dbConfig.mongodb.database}`,{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true }).then(() => {
    console.log("-------------------------------------------------- ");
    console.log("DATABASES CONNECTIONS");
    console.log("");
    console.log(`Conexion a MongoDB realizada correctamente mediante puerto: ${dbConfig.mongodb.port}`);
    console.log("-------------------------------------------------- ");
    console.log("-------------------------------------------------- ");
    console.log("MAIN SERVER CONNECTION");
    console.log("");
        if(process.env.ENVRIORMENT != 'development'){
            const https = require('https');
            const fs = require('fs');
        
            var key = fs.readFileSync('/etc/ssl/wildcard.solucionesdigitalesteco.com.ar.key');
            var cert = fs.readFileSync('/etc/ssl/_.solucionesdigitalesteco.com.ar.cer');
            var options = {
                key: key,
                cert: cert
            };
        
            var server = https.createServer(options, app);
        
            server.listen(port, () => {
                console.log(`Servidor HTTPS corriendo correctamente en puerto: ${port}`);
                console.log("-------------------------------------------------- ");
                console.log("-------------------------------------------------- ");
                console.log("PROJECT INFO");
                console.log("");
                console.log(`Comapany Name: ${cfile.projectInformation.company}`);
                console.log(`Authors: `);
                cfile.projectInformation.author.map((value) => {
                    console.log("-> ",value);
                })
                console.log("-------------------------------------------------- ");
            });
        }else {
            app.listen(port, () => {
                console.log(`Servidor HTTP corriendo correctamente en puerto: ${port}`);
                console.log("-------------------------------------------------- ");
                console.log("-------------------------------------------------- ");
                console.log("PROJECT INFO");
                console.log("");
                console.log(`Comapany Name: ${cfile.projectInformation.company}`);
                console.log(`Authors: `);
                cfile.projectInformation.author.map((value) => {
                    console.log("-> ",value);
                })
                console.log("-------------------------------------------------- ");
            })
        }

}).catch(err => console.log(err));

if(process.env.ENVRIORMENT != 'development'){
    const https = require('https');
    const fs = require('fs');
    const puertoSSL = 8080;

    var key = fs.readFileSync('/etc/ssl/wildcard.solucionesdigitalesteco.com.ar.key');
    var cert = fs.readFileSync('/etc/ssl/_.solucionesdigitalesteco.com.ar.cer');
    var options = {
        key: key,
        cert: cert
    };

    var server = https.createServer(options, app);

    server.listen(puertoSSL, () => {
        console.log("server HTTPS on port : " + port)
    });
}

