/**
 * @fileoverview Models | Modelo para Grupos
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
const helper            = require('../controllers/helper');
const files             = require('../database/migrations/Files');
const PermissionSchema  = require('../database/migrations/Permissions');
const Roles             = require('./roles');
const cfile         = helper.configFile();
const views         = require('../views');
/**
 * Clase para registrar una ruta y crear un permiso para esa ruta en particular
 */
const Permit = {
    /**
     * Consulta si el usuario tiene permiso para acceder a ese metodo
     * @param {Object} req 
     * @param {String} name 
     */
    checkPermit: async function (req, res, next){
        // Generamos el string de la ruta
        let url = req.originalUrl;
        url = url.split('/')[3];
        url = url.split('?')[0]; // Quitamos parametros que vienen por query
        if(cfile.routesNotToken.indexOf(url) === -1) {
            let consulta = String(await Permit.get(req));
            if(consulta === 'Usuario_Cambio_Clave'){
                return next();
            }
            if(!consulta) return views.error.code(res, 'ERR_18');
            if(!req.authUser[0]) return views.error.code(res, 'ERR_18');
            else if(req.authUser[0].role == 'Develop') {
                
                return next();
            }
            else{
                // Verificamos si el usuario tiene permiso para acceder
                let permisosArray = await Roles.get(req.authUser[0].role.id,true)
                if(permisosArray.length == 0) return views.error.code(res, 'ERR_18');
                for(let x = 0; x < permisosArray[0].permissionAssign.length; x++){
                    if(permisosArray[0].permissionAssign[x]._id == consulta) {
                        return next();
                    }
                }
                return views.error.code(res, 'ERR_18');
            }
        }else{
            next();
        }
    },
    /**
     * Genera un nuevo permiso, con el nombre especificado en name, asigna la ruta proveniente de REQ
     * @param {Object} req 
     * @param {String} name 
     */
    get: async function(req) {
        // Generamos el string de la ruta
        let url = req.originalUrl;
        url = url.split('?')[0]
        let urlBase = "";
        url = url.split('/');
        let section = url[3];
        let paramsInformation = {};
        for(let count in req.params) {
            if(req.params[count] !== undefined) {
                paramsInformation[count] = req.params[count]
            }
        }
        for(let x = 3; x < url.length; x++){
            let u = url[x];
            // Verificamos que el valor no este dentro de parametros
            for(let c in paramsInformation) {
                const param = paramsInformation[c];
                if(param === u){
                    u = `:${c}`
                }
            }

            if(urlBase === ""){
                urlBase = u;
            }else{
                urlBase += `/${u}`;
            }
        }
        if(urlBase[urlBase.length - 1] == '/'){
            urlBase = urlBase.substr(0,urlBase.length - 1);
        }

        /**
         * Permitimos solo al usuario que ingresa poder cambiar su contrase??a
         */
        if(urlBase == 'users/passchange'){;
            if(req.authUser[0].id == req.params.id) {
                return "Usuario_Cambio_Clave";
            }
        }
        // Asignamos los parametros no asignados al final
        for(let p in req.params){
            if(req.params[p] === undefined){
                urlBase += `/:${p}`
            }
        }
        let route = req.method + "|" + urlBase;

        // Consultamos si existe registrada esa ruta en la base de datos
        let consulta = await PermissionSchema.find({route});
        if(!consulta.length) return false;
        return consulta[0]._id;
    }
}

module.exports = Permit;