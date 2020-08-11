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
const cuartilesModelsTable = require('../migrations/cuartilesModels.table');
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
}

module.exports = cuartilesModels;