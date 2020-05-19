const helper            = require('../controllers/helper');
const groupsSchema        = require('../database/migrations/groups');
const groupsPerUserSchema = require('../database/migrations/groupsperuser');
const usersSchema       = require('../database/migrations/usersTable');

/**
 * Clase para manejar usuarios 
 * 
 * Si en el constructor se especifica ID entonces va a modificar sobre 
 */
class Groups {
    constructor(req) {
        let {group = false,
            id = false} = req;

        this.group  = group;
        this.id     = id;
    }

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

    static async userPerGroup(userId,groupId) {
        let where, c;
        if(userId && !groupId){
            // devuelve array con los grupos que pertenece el usuario
            where = {
                userId: userId
            }
        }else if(groupId && !userId){
            // Devuelve los usuarios que pertenecen a ese grupo
            where = {
                groupId: groupId
            }
        }else return false;
        try{
            c = await groupsPerUserSchema.find(where)
            return c;
        }catch (e) {
            console.log(e)
        }
    }

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

    static async delete(id){
        if(!id) return false;
        
        // Comprobamos si existen usuarios registrados a ese grupo
        let useringroup = await Groups.userPerGroup(false,id);
        if(useringroup.length) throw new Error('No se puede eliminar un grupo con usuarios asignados');

        // Eliminamos el grupo
        try {
            let c = await groupsSchema.deleteOne({_id: id});
            if(!c.deketedCount) throw new Error('Registro Inexistente');
            else return true; 
        }catch {
            return false;
        }


    }

    //5ebc72db9abf1332dc573fcf
    static async getUserGroups(userId, groupId) {
        let consulta;
        if(userId && !groupId){
            consulta = await groupsPerUserSchema.find({userId: userId});
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

    static async getUserGroupsName(userId){
        let consulta = await Groups.getUserGroups(userId);
        let ReturnData = [], tempData,c;
        for(let x = 0; x < consulta.length; x++){
            c = await groupsSchema.find({_id: consulta[x].groupId});
            tempData = {
                id: consulta[x].groupId,
                name: c[0].group
            }
            ReturnData.push(tempData);
        }
        return ReturnData;
    }

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

    static async assignUserGroup(userId, GroupArray){
        // Creamos un array de los grupos asignados
        GroupArray = String(GroupArray);
        GroupArray = GroupArray.split('|');
        // Traemos los grupos de ese usuario
        await groupsPerUserSchema.deleteMany({userId: userId});

        for(let x = 0, c; x < GroupArray.length; x++){
            c = new groupsPerUserSchema({
                userId: userId,
                groupId: GroupArray[x]
            });
            c.save().then(k => k)
        }
    }
}


module.exports = Groups;

