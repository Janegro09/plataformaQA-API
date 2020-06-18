/**
 * @fileoverview Modulo Programs
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
const { response } = require('express');
const Schemas = {
    programsGroups: require('../migrations/programsGroups.table'),
    usersByGroups: require('../migrations/groupsByUsers.table')
}

class ProgramsGroups {
    constructor(req) {
        const {name, usersAssign, id, description, status} = req;
        this.name           = name          || "";
        this.description    = description   || "";
        this.id             = id            || 0;
        this.usersAssign    = usersAssign   || [];
        this.status         = status        || true;
    }

    async save() {
        // consultamos los requeridos
        if(!this.name) throw new Error('Error en los parametros enviados');

        // Consultamos que no exista un grupo con el mismo nombre
        let c = await Schemas.programsGroups.find({name: this.name});
        if(c.length > 0) throw new Error('Nombre de grupo existente');

        // Creamos el nuevo grupo 
        c = new Schemas.programsGroups({
            name: this.name,
            description: this.description
        });

        // Guardamos el grupo
        c = await c.save();
        if(!c) throw new Error('Error al crear el grupo');
        this.id = c._id;

        // Asignamos los usuarios
        c = await this.userAssign()

        if(!c) throw new Error('Error al crear el grupo y asignarles usuarios');
        else return true;
    }

    async userAssign() {
        if(this.usersAssign.length === 0) return true;

        let userstoAssign = [];
        // Asignamos los usuarios al grupo
        for(let i = 0, users = this.usersAssign; i < users.length; i++){
            // Buscamos si el usuario existe
            const user = await includes.users.schema.find({_id: users[i]}).where({userDelete: false});
            if(user.length === 0) continue;

            // Consultamos si el usuario ya esta asignado a este grupo
            const assign = await Schemas.usersByGroups.find().where({userId: users[i], groupId: this.id});
            if(assign.length > 0) continue;

            // Asignamos el usuario
            const query = new Schemas.usersByGroups({
                userId: users[i],
                groupId: this.id
            });

            userstoAssign.push(query);
        }

        let c = await Schemas.usersByGroups.insertMany(userstoAssign);
        if(c) return true;
        else return false;
    }

    static async unassignUser(groupId, userId) {
        // Consultamos si existe el registro
        let c = await Schemas.usersByGroups.find({userId: userId, groupId: groupId});
        if(c.length === 0) throw new Error(`El usuario ${userId}, no esta asignado al grupo ${groupId}`);

        const idRegistro = c[0]._id;

        // Eliminamos el registro
        c = await Schemas.usersByGroups.deleteOne({_id: idRegistro});
        if(c.ok > 0) return true;
        else return false;
    }

    assingID (id) {
        if(!id) throw new Error('ID Not specified');
        this.id = id;
    } 

    async modify() {
        if(this.id == 0) throw new Error('ID Not specified');
        let tempData = {};
        for(let d in this) {
            if(d == "id" || d == "usersAssign") continue;
            if(this[d]){
                tempData[d] = this[d];
            }
        }

        // Consultamos si existe el grupo
        let c = await Schemas.programsGroups.find({_id: this.id}).where({deleted: false});
        if(c.length === 0) throw new Error('Grupo inexistente');
        c = await this.userAssign()
        c = await Schemas.programsGroups.updateOne({_id: this.id}, tempData);
        if(c.ok > 0) return true;
        else throw new Error('Error al actualizar el grupo')
    }

    static async delete(id) {
        if(!id) throw new Error('ID Not defined');

        // Buscamos si existe el grupo
        let c = await Schemas.programsGroups.find({_id: id}).where({deleted: false});
        if(c.length === 0) throw new Error('Grupo Inexistente');

        // Consultamos si tiene usuarios asignados
        c = await Schemas.usersByGroups.find({groupId: id});
        if(c.length > 0) throw new Error('No se puede eliminar un grupo con usuarios asignados');

        // Modificamos el paramétro deleted
        c = await Schemas.programsGroups.deleteOne({_id: id});
        if(c.ok > 0) return true;
        else return false;
    }

    static async get(id = 0) {
        // Si ID es un objeto entonces estamos recibiendo REQ y significa que el usuario esta logeado
        const req = id;
        if(id != 0 && (typeof id != 'string' && typeof id == 'object')){
            id = id.params.id;
        }
        
        let responseData = [];
        let where = {
            deleted: false
        }
        if(id != 0){
            where._id = id;
        }

        let response = await Schemas.programsGroups.find().where(where);
        if(response.length === 0) throw new Error('No existen registros en nuestra base de datos');

        for(let i = 0; i < response.length; i++){
            const tempData = {
                id: response[i]._id,
                name: response[i].name,
                status: response[i].status,
                description: response[i].description,
                dates: {
                    created: response[i].createdAt
                }
            }
            if(id) {
                // Traemos data de los usuarios asignados
                tempData.assignedUsers = [];
                let users = [];
                let _ids = [];
                const query = await Schemas.usersByGroups.find({groupId: id});
                query.map(v => {
                    _ids.push(v.userId);
                })
                if(req && typeof req == 'object'){
                    // Convertimos los _ID en id para buscarlos en el modelo de usuarios
                    for(let y = 0; y < _ids.length; y++){
                        let c = await includes.users.schema.find({_id: _ids[y]});
                        if(c.length === 0) continue;
                        else {
                            users.push(c[0].id);
                        }
                    }
                    // Si esta logeado le devolvemos info de usuarios 
                    for(let x = 0; x < users.length; x++){
                        let c = await includes.users.model.get(users[x],false,req);
                        if(!c || c.length === 0) continue;
                        tempData.assignedUsers.push({
                            idDB: c[0].idDB,
                            id: c[0].id,
                            name: c[0].name,
                            lastName: c[0].lastName,
                            email: c[0].email
                        })
                    }
                }else{
                    tempData.assignedUsers = _ids;
                }

            }

            responseData.push(tempData);
        }

        return responseData;
    }

    static async getUserGroups(id) {
        if(!id) throw new Error('Error en los parametros enviados');
        let tempData = [];

        let consulta = await Schemas.usersByGroups.find({userId: id});
        for(let x = 0; x < consulta.length; x++){
            tempData.push(consulta[x].groupId);
        }
        return tempData;
    }
}


module.exports = ProgramsGroups;