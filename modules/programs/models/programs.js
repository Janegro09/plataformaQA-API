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
    programs: require('../migrations/programs.table')
}

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
        return c.save().then(response => {
            if(response) return true;
            else return false
        }, err => {
            throw new Error(err.message);
        })
    }

    async delete() {

    }

    async modify() {

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

        let response = await Schemas.programs.find().where(where);
        if(response.length === 0) throw new Error('No existen registros en nuestra base de datos');

        if(req && typeof req == 'object'){
            UsuarioLogeado = req.authUser[0].id;
            usuariosPermitidos = await includes.users.model.getUsersperGroup(UsuarioLogeado);
            if(usuariosPermitidos[0] !== 'all' && usuariosPermitidos.length > 0) {

            }else if(usuariosPermitidos[0] !== 'all' || usuariosPermitidos.length === 0 || !usuariosPermitidos){
                throw new Error('No existen registros para mostrar');
            }
        }


        for(let i = 0; i < response.length; i++){

            // Mostramos los programas que tengan asignados los usuarios que puede ver el usuario que consulta

            if(usuariosPermitidos.length > 0 && usuariosPermitidos[0] === 'all'){
                const tempData = {
                    id: response[i]._id,
                    name: response[i].name,
                    status: response[i].status,
                    createdBy: response[i].createdBy,
                    programParent: response[i].programParent,
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
                    if(tempData.programParent) {
                        // Buscamos el padre
                    }
                    tempData.assignedGroups = [];
                }
    
                responseData.push(tempData);
            }
        }

        return responseData;
    }
}


module.exports = Program;