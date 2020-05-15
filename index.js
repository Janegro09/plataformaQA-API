const app       = require('./app');
const mongoose  = require('mongoose');
const helper    = require('./controllers/helper');
const db        = require('./controllers/db');
const cfile     = helper.configFile();
const dbConfig  = db.getData();
mongoose.Promise= global.Promise;

mongoose.connect(`mongodb://${dbConfig.mongodb.user}:${dbConfig.mongodb.password}@${dbConfig.mongodb.host}:${dbConfig.mongodb.port}/${dbConfig.mongodb.database}`,{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true }).then(() => {
    console.log("-------------------------------------------------- ");
    console.log("DATABASES CONNECTIONS");
    console.log("");
    console.log(`Conexion a MongoDB realizada correctamente mediante puerto: ${dbConfig.mongodb.port}`);
    console.log("-------------------------------------------------- ");
    console.log("-------------------------------------------------- ");
    console.log("MAIN SERVER CONNECTION");
    console.log("");
    app.listen(cfile.mainInfo.port, () => {
        console.log(`Servidor corriendo correctamente en puerto: ${cfile.mainInfo.port}`);
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
}).catch(err => console.log(err));