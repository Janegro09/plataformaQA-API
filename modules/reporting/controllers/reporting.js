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

        let report = new model(s, req.body, req.authUser);

        report.create().then(v => {
            if(!v) return includes.views.error.message(res, "Error al generar el reporte");
            else return includes.views.customResponse(res, true, 200, "Reporte", v);
        }).catch(e => {
            console.log("Err: ", e);
            return includes.views.error.message(res, e.message);
        })
    }
}

module.exports = controller;