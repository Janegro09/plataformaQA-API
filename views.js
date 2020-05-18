const helper = require('./controllers/helper');
const path   = require('path');
const fs     = require('fs');

var controller = {
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
        }
        return res.status(code).send(retData);
    },
    error: {
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
        message: (res, msg) => {
            msg = String(msg);
            return controller.customResponse(res, false, 400, msg);
        }
    },
    success: {
        file: (res, file) => res.sendFile(path.resolve(file)),
        frontUtilities: (res, data) => controller.customResponse(res, true, 200, "Utilidades para desarrolladores.",data),
        test: (res) => controller.customResponse(res, true,200, "La API responde correctamente al test"),
        delete: (res) => controller.customResponse(res, true, 200, "Registro eliminado correctamente"),
        update: (res) => controller.customResponse(res, true, 200, "Registro actualizado correctamente"),
        create: (res) => controller.customResponse(res, true, 200, "Registro agregado correctamente")
    }
}

module.exports = controller;