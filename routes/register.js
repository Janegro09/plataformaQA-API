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
const fs            = require('fs');


function register (routerObject) {
    let group;
    let routesExists = [];
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
                    
                    // cambiamos el nombre cuando tiene subsecciones (solo para modulos)
                    let rutaName = r[1].split('/');
                    if(rutaName.length > 2){
                        // Evitamos rutas de la estructura
                        if(rutaName[0] !== "files" && rutaName[0] !== "backoffice" && rutaName[0] !== "users" && rutaName[0] !== "roles" && rutaName[0] !== "groups" && rutaName[0] !== ""){
                            if(rutaName[1].indexOf(':') === -1) {
                                // Significa que no es un parametro
                                name += " " + rutaName[1]; 
                            }
                        }
                    }

                    // Eliminamos las rutas que evitan permisos
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
                    
       

                    // Almacenamos todas las rutas existentes
                    routesExists.push(route);
                    
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

    // Agregamos los permisos para ver los archivos
    // fs.readdir(global.baseUrl + '/../files/',(err, files) => {
    //     files.forEach(element => {
    //         let dataTemp = new PermissionSchema({
    //             name: `View files of folder ${element}`,
    //             route: `GET|files/${element}`,
    //             group: "files"
    //         })
    //         routesExists.push(`GET|files/${element}`);
    //         dataTemp.save().then(ok => {ok}).catch(e => {e});
    //     });
    //     deleteNotUsed(routesExists);
    // })
    deleteNotUsed(routesExists);
}

function deleteNotUsed(routesExists) {
    // Buscamos todas las rutas registradas
    let rutasDB;
    PermissionSchema.find().then(response => {
        rutasDB = response;
        routesExists.map((v, i) => {
            rutasDB = deleteToArray(rutasDB, v);
        })
        if(rutasDB.length > 0) {
            // Eliminamos las rutas sobrantes
            for(let x = 0; x < rutasDB.length; x++){
                PermissionSchema.deleteOne({_id: rutasDB[x]._id}).then(e => {e}).catch(e => {e})
            }
        }
    })
}

function deleteToArray(arr, route) {
    for(let x = 0; x < arr.length; x++) {
        if(arr[x].route === route) {
            // Si existe eliminamos la ruta del array
            arr.splice(x, 1);
        }
    }
    return arr;
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