/**
 * @fileoverview Modulo Analytics
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

const programsSchema = require('../../programs/migrations/programs.table');

// Models
const perfilamientoFile = require('../models/perfilamientoFile');
const PerfilamientoFile = require('../models/perfilamientoFile');

const controller = {
    async new(req, res) {
        if(!req.files) return includes.views.error.code(res, 'ERR_09'); 
        if(!req.files.file) return includes.views.error.code(res, 'ERR_09'); 
        const file = req.files.file;

        // Consultamos si se especifico un programa
        let program = false;
        if(req.body.program) {
            program = req.body.program;

            try{
                let query = await programsSchema.find({_id: program});
                if(query.length === 0) return includes.views.error.message(res, "Grupo inexistente");
            } catch (e) {
                return includes.views.error.message(res, e.message);
            }
        }

        if(file.mimetype != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return includes.views.error.message(res, "Formato de archivo invalido")

        const required = [
            "DNI",
            "MES",
            "PROVEEDOR",
            "PERFILAMIENTO_MES_ACTUAL",
            "ENTIDAD"
        ];

        try {
            const archivo = new includes.files(req);
            let c = await archivo.save();
            // leemos el archivo, consultamos que esten las columnas requeridas y creamos n cantidad de archivos segun lo que separemos
            let data = await includes.XLSX.XLSXFile.getData(c);

            // Validamos que existan todas las columnas
            let requiredHeaders = true;
            headers = Object.keys(data[0]);
            required.map(v => {
                if(headers.indexOf(v) === -1){
                    requiredHeaders = false;
                }
            })
            if(!requiredHeaders) throw new Error('El archivo no tiene las columnas requeridas')
            
            archivo.delete();
            // Creamos los archivos separandolos por entidad, perfilamiento actual y proveedor
            await PerfilamientoFile.dividirBaseConsolidada(data, program);

            return includes.views.customResponse(res, true, 200, "Se estan creando los archivos, en intantes podra verlos");
        } catch (e) {
            return includes.views.error.message(res, e.message);
        }
    },
    async get(req, res) {

    },
    async download(req, res) {

    },
    async delete(req, res) {

    },
    async getColumns(req, res) {

    }
}

module.exports = controller