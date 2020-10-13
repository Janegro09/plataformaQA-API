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

const model    = require('../models/reporting');

const sectionPermitted = ["analytics"]


const controller = {
    getReport: async (req, res) => {
        const { s } = req.query;

        
        try {
            let report = new model(s, req.body, req.authUser);

            let exp = await report.create();
            includes.files.getTempURL(exp.id, true).then(v => {
                if(!v) return includes.views.error.message(res, "Error al obtener el reporte");
                return includes.views.customResponse(res, true, 200, `Reporting Export`, {
                    tempId: v
                });
            }).catch(e => {
                console.log('Err: ', e);
                return includes.views.error.message(res, e.message);
            })
        } catch (e) {
            console.log("Err: ", e);
            return includes.views.error.message(res, "Error al exportar reporte");
        }
    }
}

module.exports = controller;