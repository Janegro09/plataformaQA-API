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
const partituresInfoByUsersTable = require('../migrations/partituresInfoByUsers.table');

const programsModel = require('../../programs/models/programs');

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
                        user = await includes.users.model.getUseridDB(user)
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

    static async get(req){
        const {id, userId, stepId} = req.params;
        let ReturnData = [];
        let where = {};
        let wherePartiture = "";
        let whereInstance = "";
        let whereStep = "";
        let users = [];
        let instances = [];
        let archivosPermitidos = [];
        let viewAllPartitures = false;

        // Solo traemos las partituras disponibles por programa segun usuario
        if(req){
            // comprobamos si es administrador
            let user = await includes.users.model.getUsersperGroup(req.authUser[0].id);
            if(user.indexOf('all') >= 0){
                viewAllPartitures = true;
            }
            let programasPermitidos = await programsModel.get(req);
            for(let i = 0; i < programasPermitidos.length; i++){
                const programa = programasPermitidos[i].id;
                let files = await programsModel.getFileswithPrograms(programa);
                files.map(v => {
                    if(archivosPermitidos.indexOf(v) === -1){
                        archivosPermitidos.push(v);
                    }
                })
            }
        }

        if(id && userId && stepId){
            // Retornamos informacion sobre un paso especifico
            where = {_id: id};
            wherePartiture = {partitureId: id, userId: userId};
            whereInstance = {partitureId: id}
            whereStep = {userId: userId, _id: stepId}
        }else if(id && userId){
            // Retornamos una partitura especifica de un usuario
            where = {_id: id};
            wherePartiture = {partitureId: id, userId: userId};
            whereInstance = {partitureId: id}
            whereStep = {userId: userId}
        }else if(id){
            // Retornamos una partitura
            where = {_id: id};
            wherePartiture = {partitureId: id};
        }

        try {
            // Traemos los usuarios
            if(wherePartiture){
                let u = await infobyPartitureSchema.find().where(wherePartiture);
                for(let x = 0; x < u.length; x++){
                    let temp = await includes.users.schema.find({_id: u[x].userId}).where({userDelete: false});
                    if(temp.length === 0) continue;
                    let user = {
                        idDB: temp[0]._id,
                        id: temp[0].id,
                        dni: temp[0].dni,
                        name: temp[0].name,
                        lastName: temp[0].lastName,
                        canal: temp[0].canal,
                        reponsable: temp[0].responsable,
                        lider: temp[0].lider,
                        jefeCoordinador: temp[0].jefeCoordinador,
                        edificioLaboral: temp[0].edificioLaboral,
                        G1: temp[0].nameG1,
                        G2: temp[0].nameG2,
                        partitureStatus: u[x].status
                    }
        
                    users.push(user);
                }
            }

            // Treamos las instancias
            if(whereInstance){
                let ins = await instancesSchema.find().where(whereInstance);
                for(let i = 0; i < ins.length; i++){
                    let instance = ins[i];
                    let tempData = {
                        id: instance._id,
                        name: instance.name,
                        steps: []
                    }
                    
                    // Buscamos los steps
                    whereStep.instanceId = tempData.id
                    let steps = await stepsSchema.find().where(whereStep);
                    for(let s = 0; s < steps.length; s++){
                        let st = steps[s];
                        tempData.steps.push({
                            id: st._id,
                            completed: st.completed,
                            name: st.name,
                            requestedMonitorings: st.requestedMonitorings,
                            assignedMonitorings: st.assignedMonitorings,
                            responsibleComments: st.responsibleComments,
                            managerComments: st.managerComments,
                            coordinatorOnSiteComments: st.coordinatorOnSiteComments,
                            accountAdministratorComments: st.accountAdministratorComments
                        })                    
                    }

                    if(tempData.steps.length > 0){
                        instances.push(tempData)
                    }
                }
            }

            // Traemos todas las partituras
            let c = await partituresSchema.find().where(where);
            if(c.length === 0) throw new Error('No existen registros en nuestra base de datos');

            for(let i = 0; i < c.length; c++){
                let partiture = c[i]
                if(!viewAllPartitures && archivosPermitidos.indexOf(partiture.fileId) === -1) continue;
                let tempData = {
                    id: partiture._id,
                    name: partiture.name,
                    fileId: partiture.fileId,
                    perfilamientos: partiture.perfilamientos,
                    dates: {
                        createdAt: partiture.createdAt
                    },
                    users: users,
                    instances: instances
                }
                ReturnData.push(tempData)
            }
            return ReturnData;
        } catch (e) {
            throw e
        }

    }

    static async delete(partitureId){
        if(!partitureId) throw new Error('ID no especificado')

        // Buscamos si existe una partitura con ese id
        let partiture = await partituresSchema.find({_id: partitureId});
        if(partiture.length === 0) throw new Error('Partitura inexistente')
        
        try {
            // eliminamos todos los registros 
            // partitures
            await partituresSchema.deleteMany({_id: partitureId});

            // instances
            let c = await instancesSchema.find({partitureId: partitureId}); // obtenemos el id
            if(c.length === 0) throw new Error('No existen instancias para esta partitura');
            c.map(v => {
                // stepsofinstances
                stepsSchema.deleteMany({instanceId: v._id}).then(v => {
                    v
                })
            })
            await instancesSchema.deleteMany({partitureId: partitureId});
            
            // partitures info by users
            await partituresInfoByUsersTable.deleteMany({partitureId: partitureId})

            return true;

        }catch(e) {
            throw e
        }

    }
    static async modifySteps(arrayModifications){
        if(arrayModifications.length === 0) throw new Error('Error en los parametros enviados')
        let error = false;
        for(let i = 0; i < arrayModifications.length; i++){
            const {id, userId, stepId, modify} = arrayModifications[i];

            // Chequeamos que exista ese step
            let c = await stepsSchema.find({_id: stepId, userId: userId});
            if(c.length === 0) return false;

            c = await stepsSchema.updateOne({_id: stepId, userId: userId}, modify)
            if(c.ok === 0)  {
                error = true;
            }
        }

        if(error) return false;
        else return true;
    }
}

module.exports = Partitures;