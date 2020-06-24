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
            data = data[0].data.rows;
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
            PerfilamientoFile.dividirBaseConsolidada(data, program);

            return includes.views.customResponse(res, true, 200, "Se estan creando los archivos, en intantes podra verlos");
        } catch (e) {
            return includes.views.error.message(res, e.message);
        }
    },
    async get(req, res) {
        PerfilamientoFile.getFiles().then(v => {
            if(v.length === 0) return includes.views.error.message(res, "No existen archivos");
            return includes.views.customResponse(res, true, 200, "", v);
        }, e => {
            return includes.views.error.message(res, e.message);
        })
    },
    async download(req, res) {
        if(!req.params.id) return includes.views.error.code(res, 'ERR_09'); 
        // Asignamos una url temporal a ese archivo
        includes.files.getTempURL(req.params.id).then(v => {
            if(!v) return includes.views.error.message(res, "Archivo inexistente");
            return includes.views.customResponse(res, true, 200, "URL temporal", {
                file: req.params.id,
                idTemp: v
            })
            console.log(v);
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    },
    async delete(req, res) {
        if(!req.params.id) return includes.views.error.code(res, 'ERR_09'); 
        let deleteFile = new includes.files(req.params.id);
        deleteFile.delete().then(v => {
            if(!v) return includes.views.error.message(res, "Archivo inexistente");
            else return includes.views.success.delete(res);
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    },
    async getColumns(req, res) {
        if(!req.params.id) return includes.views.error.code(res, 'ERR_09');
        PerfilamientoFile.getColumns(req.params.id).then(v => {
            console.log(v)
        }).catch(e => {
            return includes.views.error.message(res, e.message);
        })
    }
}

module.exports = controller