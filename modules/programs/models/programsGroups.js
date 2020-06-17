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
        const {name, usersAssign, id, description} = req;
        this.name           = name          || "";
        this.description    = description   || "";
        this.id             = id            || 0;
        this.usersAssign    = usersAssign   || [];
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
    }

    async modify() {

    }

    async delete() {

    }

    async get() {

    }
}


module.exports = ProgramsGroups;