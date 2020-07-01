/**
 * @fileoverview Modulo analytics | Modelo para partituras
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

const includes = require('../../includes');

// Schemas
const helper = require('../helper');

const XLSXdatabase  = require('./XLSXdatabase');

const cuartilesGroupsModel = require('./cuartilesGroups');

// Schemas
const partituresSchema = require('../migrations/partitures.table');
const instancesSchema  = require('../migrations/instancesOfPartitures.table');
const stepsSchema      = require('../migrations/stepsOfInstances.table');
const infobyPartitureSchema  = require('../migrations/partituresInfoByUsers.table');

class Partitures {
    constructor(reqObject) {
        this.file                       = reqObject.fileId || false;
        this.fileData                   = [];
        this.expirationDate             = reqObject.expirationDate || false;
        this.perfilamientosAssignados   = reqObject.perfilamientosAsignados || false;
        this.instances                  = reqObject.instances || false;
        this.users                      = [];
    }

    async create() {
        try{
            // Partitures --------------------------
            this.fileData = await cuartilesGroupsModel.getPerfilamientos(this.file, true);
            // Chequeamos la existencia de los perfilamientos asignados
            await this.getFileName();
            if(this.perfilamientosAssignados.lenth === 0 || !this.perfilamientosAssignados) throw new Error('No asigno perfilamientos')
            let perfilamientos = "";
            let partitureInfoByUser = [];
            this.perfilamientosAssignados.map(v => {
                // Chequeamos si existe
                if(!this.checkPerfilamientoExistandAddUsers(v)) throw new Error('Perfilamiento especificado inexistente en el archivo: ' + this.file._id)
                if(perfilamientos){
                    perfilamientos += ` + ${v}`
                }else{
                    perfilamientos = v;
                }
            })
            let partitureObject = {
                name: this.file.name,
                fileId: this.file._id,
                perfilamientos: perfilamientos
            }

            
            if(this.expirationDate){
                partitureObject.expirationDate = this.expirationDate;
            }
            
            // Preparamos el registro
            partitureObject = new partituresSchema(partitureObject);
            for(let u = 0; u < this.users.length; u++){
                // obtenemos el id del usuario
                let userDBid = await includes.users.model.getUseridDB(this.users[u])
                let infoUser = new infobyPartitureSchema({
                    partitureId: partitureObject._id,
                    userId: userDBid,
                    status: "pending"
                })
                partitureInfoByUser.push(infoUser);
            }
            // Instances ---------------------------------
            
            let instances = [];
            let steps = [];
            for(let i = 0; i < this.instances.length; i++){
                let instance = this.instances[i];
                let tempData = {
                    partitureId: partitureObject._id,
                    name: instance.name
                }
                if(instance.expirationDate){
                    tempData.expirationDate = instance.expirationDate;
                }
                let c = new instancesSchema(tempData);

                instances.push(c);
                // Steps --------------------------------------------
                for(let p = 0; p < instance.steps.length; p++){
                    // Creamos un registro por cada usuario
                    for(let q = 0; q < this.users.length; q++){
                        let user = this.users[q];
                        let b = new stepsSchema({
                            userId: user,
                            instanceId: c._id,
                            completed: false,
                            name: instance.steps[p].name,
                            requestedMonitorings: instance.steps[p].requiredMonitorings
                        })

                        steps.push(b)
                    }
                }                
            }
            
            
            // Guardamos todos los registros en la base de datos

            // Partituras
            let c = await partitureObject.save()
            if(!c) throw new Error('Error al crear el registro')

            // Info extra de partituras por usuarios
            c = await infobyPartitureSchema.insertMany(partitureInfoByUser);
            if(c.length === 0) throw new Error('Error al crear el registro')

            // Instancias
            c = await instancesSchema.insertMany(instances);
            if(c.length === 0) throw new Error('Error al crear el registro')

            // Steps
            c = await stepsSchema.insertMany(steps);
            if(c.length === 0) throw new Error('Error al crear el registro')
            
            return true;
        }catch(e) {
            throw e;
        }
    }

    async getFileName() {
        if(!this.file) throw new Error('Archivo inexistente')

        let c = await includes.files.checkExist(this.file);
        if(!c) throw new Error('Archivo inexistente')
        this.file = c;
        
        return true;
    }

    checkPerfilamientoExistandAddUsers(name){
        if(!name) return false;

        for(let x = 0; x < this.fileData.length; x++){
            let perfilamiento = this.fileData[x]
            if(perfilamiento.name === name){
                for(let u = 0; u < perfilamiento.usersAssign.length; u++){
                    if(this.users.indexOf(perfilamiento.usersAssign[u]) >= 0) continue;
                    this.users.push(perfilamiento.usersAssign[u])
                }
                return true;
            }
        }

        return false;
    }
}

module.exports = Partitures;