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
        const {name, parentProgram, syncGroups, id, section} = program;
        this.name           = name          || "";
        this.id             = id            || 0;
        this.syncGroups     = syncGroups    || [];
        this.parentProgram  = parentProgram || "";
        this.section        = section       || "notSpecify";
        this.createdBy      = "notSpecify";
    }

    assignCreatedBy(req){
        if(req.authUser) {
            this.createdBy = req.authUser[0].idDB;
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

    async get() {

    }
}


module.exports = Program;