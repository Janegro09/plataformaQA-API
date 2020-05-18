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
        let {id, role, permissions} = req;
        this.role               = role;
        this.permissionAssign    = permissions;
        this.id                 = id;
    }

    async save() {
        if(!this.role || !this.permissionAssign) return false;
        let c = new rolesSchema(this);
        try {
            return c.save().then(response => {
                return true;
            }, e => {
                return false;
            })
        }catch {
            return false;
        }
    }

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
            if(consulta.nModified) return true;
            else return false;
        }catch (e) {
            throw new Error(e.message);
        }


    }

    static async getPermission(id = 0){
        let tempData, dataReturn = [];
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

    static async get(id = 0, fullData = false) {
        let tempData, dataReturn = [];
        let where = id != 0 ? {_id: id} : {};
        if(id == 'Develop') return true;
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

