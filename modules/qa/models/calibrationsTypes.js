/**
 * @fileoverview Modulo QA
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

const caltypeTable = require('../migrations/calibrationsTypes.table');

class CalibrationsTypes {
    constructor(data) {
        const { name, description } = data;
        this.name           = name          || false;
        this.description    = description   || false;
    }

    async save() {
        if(!this.name) throw new Error('Error en los parametros enviados');

        // Comprobamos que no exista otro tipo de calibracion con el mismo nombre
        let consulta = await caltypeTable.find({ name: this.name });
        if(consulta.length > 0) throw new Error('Ya existe un tipo de calibracion con el mismo nombre');

        let newType = new caltypeTable(this);

        let query = await newType.save();
        if(query) return true;
        else return false;
    }

    get = async () => {
        console.log('e')
        return []
    }

    delete = async (id) => {

    }
}

module.exports = CalibrationsTypes;