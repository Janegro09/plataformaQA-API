const helper            = require('../controllers/helper');
const rolesSchema       = require('../database/migrations/Roles');
const permissionsSchema = require('../database/migrations/Permissions');
const files             = require('../database/migrations/Files');

/**
 * Clase para manejar usuarios 
 * 
 * Si en el constructor se especifica ID entonces va a modificar sobre 
 */
class Roles {
    constructor() {

    }

    static async getPermission(id){
        let tempData, dataReturn = [];
        let permissions = await permissionsSchema.find();
        if(typeof id != 'object' || id.length == 0) return false;
        else if(id[0] == 'all'){
            return permissions;
        }else {
            for(let x = 0; x < id.length; x++){
                dataReturn.push(permissions.filter(perm => perm._id == id[x]))
            }
            return dataReturn;
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

