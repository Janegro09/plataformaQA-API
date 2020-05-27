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

/**
 * Clase para registrar una ruta y crear un permiso para esa ruta en particular
 */
let Permit = {
    /**
     * Consulta si el usuario tiene permiso para acceder a ese metodo
     * @param {Object} req 
     * @param {String} name 
     */
    checkPermit: async function (req){
        // Generamos el string de la ruta
        let url = req.originalUrl;
        url = url.split('/')[3];
        if(cfile.routesNotToken.indexOf(url) === -1) {
            let consulta = String(await Permit.get(req));
            if(!consulta) return false;
            if(!req.authUser[0]) return false;
            else if(req.authUser[0].role == 'Develop') return true;
            else{
                // Verificamos si el usuario tiene permiso para acceder
                let permisosArray = await Roles.get(req.authUser[0].role.id,true)
                if(permisosArray.length == 0) return false;
                for(let x = 0; x < permisosArray[0].permissionAssign.length; x++){
                    if(permisosArray[0].permissionAssign[x]._id == consulta) return true;
                }
                return false;
            }
        }else{
            return true;
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
        let urlBase = "";
        url = url.split('/');
        let section = url[3];
        for(let x = 3; x < (url.length - Object.keys(req.params).length); x++){
            if(urlBase === ""){
                urlBase = url[x];
            }else{
                urlBase += `/${url[x]}`;
            }
        }
        let route = req.method + "|" + urlBase;
        for(let params in req.params){
            route += `/:${params}`;
        }
        // Consultamos si existe registrada esa ruta en la base de datos
        let consulta = await PermissionSchema.find({route: route});
        if(!consulta.length) return false;
        return consulta[0]._id;
    }
}

module.exports = Permit;