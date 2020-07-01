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
const Schemas = {
    programs: require('../migrations/programs.table'),
    groupsbyPrograms: require('../migrations/programsByGroups.table'),
    programsGroups: require('../migrations/programsGroups.table'),
    programsbyPerfilamientos: require('../migrations/programsbyPerfilamientos')
}
const programsGroupsModel = require('./programsGroups');

class Program {
    constructor(program){
        const {name, parentProgram, syncGroups, id, section, description} = program;
        this.name           = name          || "";
        this.description    = description   || "";
        this.id             = id            || 0;
        this.syncGroups     = syncGroups    || [];
        this.parentProgram  = parentProgram || "";
        this.section        = section       || "notSpecify";
        this.createdBy      = "notSpecify";
    }

    assignCreatedBy(req){
        if(req.authUser) {
            this.createdBy = req.authUser[0].id;
        }
    }

    async assigngroup() {
        let groupstoassign = [];
        let groups = [];
        // Consultamos que los grupos no esten asignados al programa
        for(let i = 0; i < this.syncGroups.length; i++) {
            let c = await Schemas.groupsbyPrograms.find().where({
                programId: this.id,
                groupId: this.syncGroups[i]
            })
            if(c.length === 0){
                groups.push(this.syncGroups[i]);
            }
        }

        groups.map(v => {
            const tempData = new Schemas.groupsbyPrograms({
                programId: this.id,
                groupId: v
            })
            groupstoassign.push(tempData)
        })

        let c = await Schemas.groupsbyPrograms.insertMany(groupstoassign);
        if(c) return true;
        else false;
    }

    async save() {
        // Comprobamos que esten todas los parametros requeridos
        if(!this.name) throw new Error("Faltan parametros importantes para el modulo programas");

        // buscamos que no exista otro programa con el mismo nombre
        let c = await Schemas.programs.find({name: this.name});
        if(c.length > 0) throw new Error('Ya existe un registro con el mismo nombre');

        // Buscamos si existe el programa padre
        if(this.parentProgram) {
            c = await Schemas.programs.find({_id: this.parentProgram});
            if(c.length === 0) throw new Error('El programa padre especificado no existe');
        }

        if(this.section) {
            if(this.section !== "M" && this.section !== "P"){
                this.section = "notSpecify";
            }
        }

        // Creamos el nuevo registro
        c = new Schemas.programs({
            name: this.name,
            description: this.description,
            parentProgram: this.parentProgram,
            section: this.section,
            createdBy: this.createdBy
        })
        this.id = c._id;
        await this.assigngroup();
        return c.save().then(response => {
            if(response) return true;
            else return false
        }, err => {
            throw new Error(err.message);
        })
    }

    static async unassignGroup(programId, groupId) {
        // Consultamos si existe el registro
        let c = await Schemas.groupsbyPrograms.find({programId: programId, groupId: groupId});
        if(c.length === 0) throw new Error(`El grupo ${groupId}, no esta asignado al programa ${programId}`);

        const idRegistro = c[0]._id;

        // Eliminamos el registro
        c = await Schemas.groupsbyPrograms.deleteOne({_id: idRegistro});
        if(c.ok > 0) return true;
        else return false;
    }

    static async delete(id) {
        if(!id) throw new Error('ID Not defined');

        // Buscamos si existe el grupo
        let c = await Schemas.programs.find({_id: id}).where({deleted: false});
        if(c.length === 0) throw new Error('Programa Inexistente');

        // Consultamos si tiene grupos asignados
        c = await Schemas.groupsbyPrograms.find({programId: id});
        if(c.length > 0) throw new Error('No se puede eliminar un programa con grupos asignados');

        // Modificamos el paramétro deleted
        c = await Schemas.programs.deleteOne({_id: id});
        if(c.ok > 0) return true;
        else return false;
    }

    async modify() {
        if(this.id == 0) throw new Error('ID Not specified');

        let tempData = {};
        for(let d in this) {
            if(d == "id" || d == "syncGroups" || d == "createdBy") continue;
            if(this[d]){
                tempData[d] = this[d];
            }
        }

        // Consultamos si existe el programa
        let c = await Schemas.programs.find({_id: this.id}).where({deleted: false});
        if(c.length === 0) throw new Error('Programa inexistente');
        c = await this.assigngroup();
        c = await Schemas.programs.updateOne({_id: this.id}, tempData);
        if(c.ok > 0) return true;
        else throw new Error('Error al actualizar el programa')
    }

    static async get(id = 0) {
        const req = id;
        if(id != 0 && (typeof id != 'string' && typeof id == 'object')){
            id = id.params.id || 0;
        }
        let usuariosPermitidos, UsuarioLogeado;
        let responseData = [];
        let where = {
            deleted: false
        }
        if(id != 0){
            where._id = id;
        }

        let gruposDisponibles   = [];
        let programasPermitidos = [];
        if(req && typeof req == 'object'){
            UsuarioLogeado = req.authUser[0].id;
            usuariosPermitidos = await includes.users.model.getUsersperGroup(UsuarioLogeado);
            if(usuariosPermitidos[0] !== 'all' && usuariosPermitidos.length > 0) {
                if(usuariosPermitidos.indexOf(req.authUser[0].idDB) === -1) {
                    // Agregamos el usuario que consulta para agregar los prog
                    usuariosPermitidos.push(req.authUser[0].idDB)
                }
                // Buscamos los grupos de programa de cada usuario
                for(let x = 0; x < usuariosPermitidos.length; x++) {
                    let tempData = await programsGroupsModel.getUserGroups(usuariosPermitidos[x]);
                    if(tempData.length > 0) {
                        tempData.map(v => {
                            if(gruposDisponibles.indexOf(v) === -1) {
                                gruposDisponibles.push(v);
                            }
                        })
                    }
                }

                // Buscamos que programas pertenencen a estos grupos
                let programas = await Schemas.groupsbyPrograms.find().where({
                    groupId: {
                        $in: gruposDisponibles
                    }
                });
                programas.map(v => {
                    programasPermitidos.push(v.programId);
                })
            }else if(usuariosPermitidos[0] !== 'all' || usuariosPermitidos.length === 0 || !usuariosPermitidos){
                throw new Error('No existen registros para mostrar');
            }
        }
        let response;
        if(usuariosPermitidos[0] === 'all'){
            response = await Schemas.programs.find().where(where);
        }else{
            if(id != 0) {
                // Usuario no admin busca un programa especifico
                if(programasPermitidos.indexOf(id) === -1){
                    throw new Error('No existe el registro buscado en nuestra base de datos');
                }else {
                    response = await Schemas.programs.find().where(where);
                }
            }else {
                // Solo le listamos los programas disponibles porque esta buscando todos los programas
                where._id = {
                    $in: programasPermitidos
                }
                response = await Schemas.programs.find().where(where);
            }

        }
        if(response.length === 0) throw new Error('No existen registros en nuestra base de datos');


        for(let i = 0; i < response.length; i++){

            // Mostramos los programas que tengan asignados los usuarios que puede ver el usuario que consulta
            const tempData = {
                id: response[i]._id,
                name: response[i].name,
                status: response[i].status,
                createdBy: response[i].createdBy,
                programParent: response[i].parentProgram,
                section: response[i].section,
                description: response[i].description,
                dates: {
                    start: response[i].fechaInicio,
                    end: response[i].fechaFin,
                    created: response[i].createdAt
                }
            }
            if(id) {
                // Hacemos los request para traer toda la info
                tempData.assignedGroups  = await Program.getgroupsbyPrograms(response[i]._id);
            }

            responseData.push(tempData);
        }

        return responseData;
    }

    static async getgroupsbyPrograms(programId) {
        let dataReturn = [];
        let c = await Schemas.groupsbyPrograms.find({programId: programId});
        for(let i = 0; i < c.length; i++){
            let tempData = await Schemas.programsGroups.find({_id: c[i].groupId});
            if(tempData.length === 0) continue;
            dataReturn.push({
                id: tempData[0]._id,
                name: tempData[0].name,
                status: tempData[0].status
            })
        }

        return dataReturn;

    }

    /**
     * Funcion para asignar programas a perfilamiento
     * @param {String} filePerfilamientoId 
     * @param {String} programId
     */
    static async assignProgramtoPerfilamiento(filePerfilamientoId, programId){
        if(!filePerfilamientoId || !programId) return false;
        
        // Buscamos si existe el programa a asignar
        let c = await Schemas.programs.find({_id: programId});
        if(c.length === 0) return false;

        // Consultamos si existe el archivo

        // Eliminamos los programas asignados
        c = await Schemas.programsbyPerfilamientos.deleteMany({PerfilamientoFileId: filePerfilamientoId});

        c = new Schemas.programsbyPerfilamientos({
            programId: programId,
            PerfilamientoFileId: filePerfilamientoId           
        })
        c.save().then(ok => {ok}, e => {e})
        return true;
    }

    static async getProgramtoPerfilamiento(fileId) {
        if(!fileId) return false;
        
        // Buscamos si tiene asignados programas
        let c = await Schemas.programsbyPerfilamientos.find({PerfilamientoFileId: fileId});
        if(c.length === 0) return false;

        // Busucamos el programa asignado
        c = await Schemas.programs.find({_id: c[0].programId});
        if(c.length === 0) return false;

        return {
            id: c[0]._id,
            name: c[0].name
        }
    }
}


module.exports = Program;