const helper            = require('../controllers/helper');
const groupsSchema        = require('../database/migrations/groups');


/**
 * Clase para manejar usuarios 
 * 
 * Si en el constructor se especifica ID entonces va a modificar sobre 
 */
class Groups {
    constructor() {

    }

    static async get(id) {
        // Traemos el grupo 
        try {
            let consulta = await groupsSchema.findById(id);
            if(!consulta) return "";
            else return consulta;
        } catch (e) {
            return "";
        }
        
    }
}


module.exports = Groups;

