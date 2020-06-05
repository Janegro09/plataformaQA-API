/**
 * @fileoverview Models | Modelo para Roles
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
const rolesSchema       = require('../database/migrations/Roles');
const permissionsSchema = require('../database/migrations/Permissions');
const files             = require('../database/migrations/Files');
const userSchema        = require('../database/migrations/usersTable');

/**
 * Clase para manejar usuarios 
 * 
 * Si en el constructor se especifica ID entonces va a modificar sobre 
 */
class Roles {
    constructor(req) {
        let {id, role, permissions, description} = req;
        this.role               = role;
        this.permissionAssign   = permissions;
        this.id                 = id;
        this.description        = description;
    }

    /**
     * Guarda un rol
     */
    async save() {
        if(!this.role) return false;
        let data = {};
        for(let x in this){
            if(!this[x]) continue;
            else {
                data[x] = this[x];
            }
        }
        let c = new rolesSchema(this);
        try {
            return c.save().then(response => {
                return response;
            }, e => {
                return false;
            })
        }catch {
            return false;
        }
    }

    /**
     * Actualiza un rol
     */
    async update(){
        // Consultamos si existe el rol
        if(!this.id) return false;
        try {
            let consulta = await rolesSchema.find({_id: this.id});
            if(!consulta.length || consulta[0].role === 'Administrator') throw new Error("No existe el Rol ingresado o intenta modificar un rol importante para el sistema");

            let dataUpdate = {};
            for(let x in this){
                if(x == 'id') continue;
                else if(!this[x]) continue;
                dataUpdate[x] = this[x];
            }

            
            // Actualizamos los registros
            consulta = await rolesSchema.updateOne({_id: this.id}, dataUpdate);
            if(consulta.nModified || consulta.ok) return true;
            else return false;
        }catch (e) {
            throw new Error(e.message);
        }


    }

    /**
     * devuelve los permisos que existen en un grupo
     * @param {Array} id ids de permisos 
     */
    static async getPermission(id = 0){
        let dataReturn = [];
        let permissions = await permissionsSchema.find();
        if(id === 0) return permissions;
        if(typeof id != 'object' || id.length == 0) return false;
        else if(id[0] == 'all'){
            return permissions;
        }else {
            let idTemp;
            for(let x = 0; x < permissions.length; x++){
                idTemp = String(permissions[x]._id);
                if(id.indexOf(idTemp) !== -1){
                    dataReturn.push(permissions[x]);
                }
            }
            return dataReturn;
        }
    }

    /**
     * Elimina un rol si no existen usuarios asignados
     * @param {String} id 
     */
    static async delete(id) {
        // Consultamos si existe el rol
        try {
            let consulta = await rolesSchema.find({_id: id});
            if(!consulta.length || consulta[0].role === 'Administrator') throw new Error("No existe el Rol ingresado o intenta eliminar un rol importante para el sistema");

            // Consultamos si existen usuarios asignados
            consulta = await userSchema.find({role: id});
            if(consulta.length) throw new Error("No se puede eliminar un rol con usuarios asignados");

            // Eliminamos el rol
            consulta = await rolesSchema.deleteOne({_id: id});
            if(consulta.deletedCount) return true;
            else return false;
            
        }catch (e) {
            throw new Error(e.message);
        }
    }

    /**
     * Consulta si existe un rol con ese nombre, sino lo crea
     * @param {String} rolName  
     * @param {String} rolDescription 
     * 
     * @returns {String} rolID
     */
    static async getornewRol(rolName, rolDescription = ""){
        if(!rolName) return false;
        if(typeof rolName !== 'string') return false;
        let c = await rolesSchema.find({role: rolName});
        let id = "";
        if(c.length === 0) {
            // Significa que no existe y creamos uno nuevo
            c = new Roles({role: rolName, description: rolDescription});
            c = await c.save();
            id = c._id;
        }else{
            // Devolvemos el id
            id = c[0]._id;
        }
        return id;
    }

    /**
     * Devuelve los roles, si se especifica fullData entonces devolvera los permisos asignados a ese rol
     * @param {String} id 
     * @param {Boolean} fullData 
     */
    static async get(id = 0, fullData = false) {
        let tempData, dataReturn = [];
        let where = id != 0 ? {_id: id} : {};
        where = id == 'Develop' ? {role: 'Administrator'} : where;
        try {
            let rol = await rolesSchema.find(where);
            if(rol.length == 0) return false;
            for(let x = 0; x < rol.length; x++){
                tempData = {
                    id: rol[x]._id,
                    role: rol[x].role
                };
                if(fullData){
                    // Traemos todos los permisos
                    let permisos = await Roles.getPermission(rol[x].permissionAssign);
                    tempData.permissionAssign = permisos;
                }
                dataReturn.push(tempData);
            }
            return dataReturn;
        }catch (e) {
            return false;
        }
    }
}


module.exports = Roles;

