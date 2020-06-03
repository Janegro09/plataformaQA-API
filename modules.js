
/**
 * @fileoverview Incluimos los modulos, y comprobamos que tengan los archivos necesarios para funciona
 * 
 * Los archivos necesarios para el funcionamiento son
 * 
 * /<nombreModulo>
 *         routes.js --> Rutas del modulo
 *         /controllers --> Controladores del modulo (Directorio Requerido)
 *         /models      --> Modelos del modulo (Directorio Requerido)
 *         /migrations  --> Manipulacion de bases de datos de modulos (Directorio Opcional)
 *         /middlewares --> Middlewares (Directorio Opcional)
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

const fs       = require('fs');
const helper   = require('./controllers/helper');

module.exports = function() {
   global.modules = [];
   const mainRoute = './modules';
   // Chequeamos si existe la carpeta modules
   if(!fs.statSync(mainRoute).isDirectory()) throw Error('No existe la carpeta modules');

   let modRoute, tempData, moduleData;
   fs.readdirSync(mainRoute).map(v => {
      modRoute = mainRoute + '/' + v;
      if(v.substr(0,1) === '.') return false;
      if(!fs.statSync(modRoute).isDirectory()) return false;
      
      // Comprobamos si existen los archivos necesarios para el sistema y almacenamos todos en un array
      let FilesRequired = ["routes.js","controllers","models", "module.json"];
      for(let x = 0; x < FilesRequired; x++){
         if(fs.readdirSync(modRoute).indexOf(FilesRequired[x]) === -1) throw Error('Error al cargar archivos en el modulo: ' + modRoute);
      }

      // Incluimos el archivo de configuracion del modulo
      moduleData = JSON.parse(fs.readFileSync(modRoute + '/module.json'));
      tempData = {
         name: moduleData.name.toLowerCase(),
         version: moduleData.version,
         requires: {
            routes: require(modRoute + '/routes.js')
         }
      }

      // Incluimos el archivo migrations
      if(helper.files.exists(modRoute + '/migrations/migrations.js')){
         tempData.requires.migrations = require(modRoute + '/migrations/migrations.js');
      }

      global.modules.push(tempData);

   })
}();