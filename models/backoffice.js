/**
 * @fileoverview Models | Modelo para Backoffice
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
const mongoose = require('mongoose');
const rolesSchema = require('../database/migrations/Roles');
const groupsSchema = require('../database/migrations/groups');
const groupsPerUsers = require('../database/migrations/groupsperuser');

module.exports.exportData = class Export {
    constructor(type, name) {
        this.type       = type || false;
        this.name       = name || false;
        this.data       = null;
        this.headers    = null; 
        this.fileId     = null;
    }

    async getData() {
        switch(this.type) {
            case "database": 
                await this.getDatabase();
                break;
            default:
                throw new Error('Error en el tipo especificado');
        }

        await this.crearXLSX();

    }
    
    async getDatabase() {
        let { name } = this;
        this.headers = [];

        const authorizedTables = ["users"];

        if(!authorizedTables.includes(name)) throw new Error('Nombre de base de datos sin metodo de exportacion');

        const models = mongoose.connections[0].models;
        let model = null;

        for(let i in models){
            let modelName = i.toLowerCase();
            if(name == modelName){
                model = models[i]
            }
        }
        let response = await model.find(); // Treamos todos los registros
        
        let roles = null;
        let groups = null;
        if(name === 'users') {
            roles = await rolesSchema.find({roleDeleted: false});
            //groups = await groupsSchema.find({groupDeleted: false});
        }

        let DataReturn = [];
        for(let r of response) {
            const register = r['_doc'];
            let tempData = {};
            if(name === 'users') {
                // Si el usuario esta eliminado saltamos
                if(register.userDelete) continue;
                
                
                /**
                 * Se desactivo agregar los usuarios cuando se exporta en XLSX porque baja mucho la performance.
                 */
                let userGroups = null
                // buscamos los grupos del usuario
                if(register._id && groups && false) {
                    register.groups = "";
                    const userId = register._id;
                    let c = await groupsPerUsers.find({userId});
                    if(c.length > 0){
                        for(let g of c){
                            let temporal = groups.find(element => element._id == g.groupId).group;
                            if(register.groups){
                                register.groups += ` | ${temporal}`
                            }else {
                                register.groups = temporal
                            }
                        }
                    }                   
                }
            }

            for(let y in register){
                if(y == '_id' || y == '__v' || y == 'password') continue;
                if(register[y] instanceof Date){
                    let d = new Date(register[y]);

                    tempData[y] = `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()} | ${d.getUTCHours()}:${d.getUTCMinutes()}`
                } else if(y == 'role' && roles){
                    tempData[y] = register[y];
                    
                    let c = roles.find(element => element._id == register[y]);
                    if(c){
                        tempData[y] = c.role
                    }
                } else {
                    tempData[y] = register[y]
                }
                
                // Almacenamos los headers
                if(!this.headers.includes(y)){
                    this.headers.push(y)
                }
                
            }
            
            DataReturn.push(tempData)
        }
        this.data = DataReturn;
    }

    async crearXLSX() {
        const { data, headers } = this;

        console.log(headers) // headers para crear el XLSX
        

    }
}

