/**
 * @fileoverview Estructura de respuesta principal
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

// Incluimos controladores, modelos, schemas y modulos
const helper = require('./controllers/helper');
const path   = require('path');
const fs     = require('fs');

var controller = {
    /**
     * Funcion default para responses, crea la estructura unica de respuesta
     * 
     * @param {Object}  res res 
     * @param {Boolean} success true si no hay errores
     * @param {Number}  code codigo de respuesta HTTP
     * @param {String}  msg mensaje para agregar a la respuesta
     * @param {object}  data respuesta principal de información
     * @param {object}  user usuario logeado, default = false, y buscara el usuario logeado con su respectivo token
     * 
     * @returns {}
     */
    customResponse: (res, success = true, code = 200, msg = "", data = {}, user = false) => {
        let retData = {
            Success: success,
            Message: msg,
            HttpCodeResponse: code
        }
        if(Object.keys(data).length > 0){
            retData.Data = data;
        }
        if(user !== false || res.authUser){
            retData.loggedUser = res.authUser ? helper.users.loggedUser(res.authUser[0]) : user;
        }else{
            retData.loggedUser = false;
        }
        return res.status(code).send(retData);
    },

    /**
     * Respuestas por default en operaciones con errores o success false
     */
    error: {
        /**
         * Esta, buscara el codigo especificado en el archivo errorCodes.json
         * @param {Object}  res res 
         * @param {String}  codeId ID Codigo buscado en /databases/json/errorCode.json STX: ERR_01
         */
        code: (res, codeId) => {
            let codes = JSON.parse(fs.readFileSync("./database/json/errorCodes.json"));
            if(codeId != undefined){
                let code = codes[codeId];
                if(code != undefined){
                    return controller.customResponse(res, false, code.HTTP_CODE, code.MENSAJE,{});
                }else{
                    return controller.error(res, `Codigo de error invalido: ${codeId}`);
                }
            }
        },
        
        /**
         * Esta devolvera un error con el mensaje especificado en MSG
         * @param {Object} res res 
         * @param {String} msg Mensaje de error 
         */
        message: (res, msg) => {
            msg = String(msg);
            return controller.customResponse(res, false, 400, msg);
        }
    },
    /**
     * Respuestas por default en operaciones sin errores o success true
     */
    success: {
        file: {
            download: (res, file) => res.download(path.resolve(file)),
            sendFile: (res, file) => res.sendFile(path.resolve(file))
        },
        frontUtilities: (res, data) => controller.customResponse(res, true, 200, "Utilidades para desarrolladores.",data),
        test: (res) => controller.customResponse(res, true,200, "La API responde correctamente al test"),
        delete: (res) => controller.customResponse(res, true, 200, "Registro eliminado correctamente"),
        update: (res) => controller.customResponse(res, true, 200, "Registro actualizado correctamente"),
        create: (res) => controller.customResponse(res, true, 200, "Registro agregado correctamente")
    }
}

module.exports = controller;