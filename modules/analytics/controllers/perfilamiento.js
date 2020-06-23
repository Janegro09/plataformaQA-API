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

const controller = {
    async new(req, res) {
        if(!req.files) return includes.views.error.code(res, 'ERR_09'); 
        if(!req.files.file) return includes.views.error.code(res, 'ERR_09'); 
        const file = req.files.file;

        if(file.mimetype != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return includes.views.error.message(res, "Formato de archivo invalido")

        const required = [
            "DNI",
            "MES",
            "PROVEEDOR",
            "ADM",
            "ENTIDAD"
        ];

        const archivo = new includes.files(req);
        let c = await archivo.save();

        console.log(c);

        // console.log(c);
        archivo.delete();

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