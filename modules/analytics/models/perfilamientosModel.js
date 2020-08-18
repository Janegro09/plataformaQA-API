/**
 * @fileoverview Modulo analytics
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
const cuartilesModelsTable = require('../migrations/perfilamientosModels.table');
// Schemas

class cuartilesModels {
    constructor(obj) {
        this.name   = obj.name      || false;
        this.values = obj.values    || false;
    }

    async save() {
        const { name, values } = this;
        if(!name || !values) throw new Error('Error en los parametros enviados')

        // Buscamos si existe otro registro con ese nombre
        let c = await cuartilesModelsTable.find({ name });
        if(c.length > 0) throw new Error('El nombre ya ha sido utilizado');

        c = new cuartilesModelsTable({
            name, values
        })

        let query = await c.save();
        if(query) return true
        else return false;
    }

    static async get(){
        return await cuartilesModelsTable.find();


    }

    static async modify(id, modifyData) {
        const { values, name } = modifyData;
        if(!id || !values || !name) throw new Error('Error en los parametros enviados');

        // Buscamos si el nombre modificado existe en la base de datos
        let c = await cuartilesModelsTable.find({name});
        if(c.length > 0) {
            // Vemos si el que existe es el mismo id del que modificamos entonces significa que no modificamos el nombre

            if(c[0]._id != id) throw new Error('El nombre ingresado ya fue utilizado');
        }

        c = await cuartilesModelsTable.updateOne({ _id: id }, { name, values });
        if(c.ok) return true;
        else return false;
        
    }

    static async delete(id) {
        if(!id) throw new Error('Error en los parametros enviados');

        let c = await cuartilesModelsTable.deleteOne({ _id: id });
        if(c.ok) return true;
        else return false;
    }
}

module.exports = cuartilesModels;