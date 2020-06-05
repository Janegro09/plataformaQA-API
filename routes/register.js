/**
 * @fileoverview Registro de rutas y permisos en la base de datos
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
const helper        = require('../controllers/helper')
const router        = express.Router();
const cfile         = helper.configFile();
const PermissionSchema  = require('../database/migrations/Permissions');


function register (routerObject) {
    let group;

    routerObject._router.stack.map(v => {
        group = getGroupName(v.regexp);
        if(v.handle.stack){
            let path, method, functions, name, route, dataTemp;
            for(let x = 0, y = v.handle.stack; x < y.length; x++){
                // Prepara el string de path
                path = String(y[x].route.path);
                path = path.replace(/\?/gi,'');
                path = path.replace( cfile.mainInfo.routes ,'');
                functions = y[x].route.stack
                for(let i = 0; i < functions.length; i++){
                    if(functions[i].name == 'checkPermit') continue;
                    name = group ? functions[i].name + ' ' + group : functions[i].name;
                    // group = group || name;
                    
                    method = (functions[i].method).toUpperCase();
                    if(group != "" && path == '/'){
                        route = method + '|' + group;
                    }else{
                        route = method + '|' + group + path;
                    }
                    // No almacenamos las rutas que estan en config.json
                    let r = route.split('|');
                    if(r[1] == '/') {
                        continue;
                    }else{
                        if(r[1].charAt(0) == '/'){
                            r[1] = r[1].substr(1,r[1].length - 1);
                        }
                        r[1] = r[1].split('/');
                        if(cfile.routesNotToken.indexOf(r[1][0]) >= 0){
                            continue;
                        }
                    }
                    route = route.replace('|/','|');
                    // Sacamos la / principal en caso que exista
                    
                    dataTemp = new PermissionSchema({
                        name: name,
                        route: route,
                        group: group
                    });
                    // Agrega la ruta si no existe
                    dataTemp.save().then(ok => {ok}).catch(e => {e});
                }
            }
        }
    })
}

function getGroupName(group) {
    group = String(group);
    group = group.substr(3);
    group = group.replace('(?=\\/|$)/i','')
    group = group.split('\\');
    group = group.length > 1 ? group[2] : group[0];
    group = group.replace('?','')
    group = group.replace('/','')
    return group;
}

module.exports = register;