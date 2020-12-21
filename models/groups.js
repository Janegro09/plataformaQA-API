/**
 * @fileoverview Models | Modelo para Grupos
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
const groupsSchema        = require('../database/migrations/groups');
const groupsPerUserSchema = require('../database/migrations/groupsperuser');
const usersSchema       = require('../database/migrations/usersTable');
const Roles = require('./roles');

/**
 * Clase para manejar Grupos 
 */
class Groups {
    constructor(req) {
        let {group = false,
            id = false} = req;

        this.group  = group;
        this.id     = id;
    }

    /**
     * Guarda un nuevo grupo
     */
    async save() {
        if(!this.group) return false;
        let data = {};
        for(let x in this){
            if(!this[x]) continue;
            data[x] = this[x];
        }

        // Consultamos que el nombre de grupo no exista
        try {
            let c = new groupsSchema(data);
            c = await c.save();
            return c;
        }catch (e) {
            return false;
        }
    }

    /**
     * Actualiza un grupo existente por _id
     */
    async update() {
        if(!this.id || !this.group) return false;

        // Consultamos si existe el grupo
        let c = await Groups.get(this.id);
        if(!c.length) return false;

        try {
            c = await groupsSchema.updateOne({_id: this.id}, {group: this.group});
            if(!c.nModified) return false;
            else return true;
        } catch {
            return false;
        }
    }

    /**
     * Devuelve los datos del grupo consultado por ID
     * @param {String} id ID de grupo
     */
    static async get(id = 0) {
        let returnData = [], tempData, where = {
            groupDeleted: false
        };
        // Traemos el grupo 
        if(id !== 0 && id){
            // Listamos solo uno
            where._id = id;
        }
        try {
            var consulta = await groupsSchema.find(where);
            if(!consulta) return "";
        } catch (e) {
            return "";
        }
        consulta.map(v => {
            tempData = {
                id: v._id,
                group: v.group
            }
            returnData.push(tempData);
        })
        return returnData;

    }

    /**
     * Consulta si el grupo tiene usuarios asignados, y si no tiene ninguno entonces elimina el grupo
     * @param {String} id 
     */
    static async delete(id){
        if(!id) return false;
        
        // Comprobamos si existen usuarios registrados a ese grupo
        let useringroup = await Groups.getUserGroups(false,id);
        if(useringroup.length > 0) return false;
        try {
            let c = await groupsSchema.deleteOne({_id: id});
            if(!c.deletedCount) return false;
            else return true; 
        }catch {
            return false;
        }


    }

    static async getGruposAutorizados(userId) {
        let returnData = [];
        let consulta;
        if(userId){
            // Obtenemos el rol del usuario que consulta
            consulta = await usersSchema.find({_id: userId});
            if(consulta.length > 0) {
                consulta = await Roles.get(consulta[0].role)
                if(consulta.length > 0) {
                    if(consulta[0].role === 'ADMINISTRATOR') {
                        returnData = ['all'];
                    } else {
                        returnData = await groupsPerUserSchema.find({userId});
                    }
                }
            }
        }
        return returnData;
    }

    /**
     * Si se especifica solo userId devuelve array con los grupos que pertenece el usuario, si solo se especifica groupId, devuelve los usuarios que pertenecen a ese grupo 
     * @param {String} userId 
     * @param {String} groupId 
     */
    static async getUserGroups(userId, groupId) {
        let consulta;
        if(userId && !groupId){
            consulta = await groupsPerUserSchema.find({userId});
        }else if(!userId && groupId){
            // Devuelve un array con ids de usuarios pertenecientes a ese grupo
            let c = await groupsPerUserSchema.find({groupId: groupId});
            consulta = [];
            for(let x = 0; x < c.length; x++){
                consulta.push(c[x].userId);
            }
        }
        return consulta;
    }

    /**
     * 
     * @param {String} userId Devuelve los nombres de los grupos pertenecientes a un usuario 
     */
    static async getUserGroupsName(userId){
        let consulta = await Groups.getUserGroups(userId);
        let ReturnData = [], tempData,c;
        for(let x = 0; x < consulta.length; x++){
            c = await groupsSchema.find({_id: consulta[x].groupId});
            if(c.length > 0) {
                tempData = {
                    id: consulta[x].groupId,
                    name: c[0].group
                }
                ReturnData.push(tempData);
            }
        }
        return ReturnData;
    }

    /**
     * Esta, consulta la existencia de un grupo con ese nombre, si existe devuelve el ID del mismo, sino lo crea y devuelve el ID
     * @param {String} groupName Nombre del grupo
     * 
     */
    static async getorcreateGroup(groupName){
        if(!groupName) return false;
        if(typeof groupName !== 'string') return false;
        let teco = groupName.split(" ");
        if(teco[0] == "TECO" || teco[0] == "CCT"){
            groupName = "TELECOM";
        }
        let c = await groupsSchema.find({group: groupName});
        let id;
        if(c.length === 0){
            // Entonces agregamos un nuevo grupo;
            c = new Groups({group: groupName});
            c = await c.save();
            id = c._id;
        }else{
            id = c[0]._id;
        }
        return id;
    }

    /**
     * Esta funcion asigna grupos a un usuari
     * @param {String} userId ID del usuario a asignar
     * @param {String} GroupArray se pueden enviar mas de un grupo, separados por |
     */
    static async assignUserGroup(userId, GroupArray){
        // Creamos un array de los grupos asignados
        GroupArray = String(GroupArray);
        GroupArray = GroupArray.split('|');
        // Traemos los grupos de ese usuario
        await groupsPerUserSchema.deleteMany({userId: userId});

        for(let x = 0, c; x < GroupArray.length; x++){
            // Verificamos si existe el grupo
            c = await groupsSchema.find({_id: GroupArray[x]});
            if(c.length > 0){
                c = new groupsPerUserSchema({
                    userId: userId,
                    groupId: GroupArray[x]
                });
                c.save().then(k => k)
            }
        }
    }
}

module.exports = Groups;