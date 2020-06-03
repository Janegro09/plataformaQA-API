/**
 * @fileoverview Controller | Controlador de usuarios
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
const helper        = require('./helper');
const views         = require('../views');    
const usersModel    = require('../models/users');
const FileUpload    = require('./files');
const Permit        = require('../models/permissions')

var controller = {
    async new(req, res) {
        let img;
        if(!helper.regExCheck(req.body.email, 3)) {
            return views.error.code(res,'ERR_09')
        }
        if(req.files){
            img = new FileUpload(req);
            img = await img.save();
        }
        req.body.imagen = img ? img.id : false;
        let User = new usersModel(req.body);
        let c = await User.save();
        if(!c) return views.error.code(res,'ERR_12');
        else{
            return views.customResponse(res, true, 200, "", c)
        }
    },
    async get(req, res) {
        // Registamos route
        let id = req.params.id ? req.params.id : 0;
        let users;
        try{
            users = await usersModel.get(id,false,req);
            if(users.length == 0 || !users) return views.error.code(res, 'ERR_07');
            else{
                views.customResponse(res,true,200,"",users);
            }    
        }catch(e){
            console.log(e);
            return views.error.code(res, 'ERR_08');
        }
    },
    async delete(req, res) {
        usersModel.userDelete(req.params.id).then((v) => {
            if(!v) return views.error.code(res, 'ERR_10');
            else return views.success.delete(res)
        })
    },
    async update(req, res) {
        let dataUpdate = {
            id: req.params.id
        };
        let user = await usersModel.get(dataUpdate.id);
        if(user.length == 0) return views.error.code(res, 'ERR_08'); // El
        for(d in req.body){
            if(req.body[d] != ""){
                dataUpdate[d] = req.body[d]
            }
        }

        if(req.files){
            img = new FileUpload(req);
            img = await img.save();
            dataUpdate.imagen = img.id;
        }
        let update = new usersModel(dataUpdate);
        update = await update.update();
        if(!update.length) return views.error.code(res, 'ERR_11');
        return views.customResponse(res, true, 200, "", update);
    },
    async diabled(req, res) {
        if(!req.params.id) return views.error.code(res, 'ERR_09');
        usersModel.userChangeStatus(req.params.id).then((v) => {
            if(v) return views.success.update(res)
            else return views.error.code(res, 'ERR_11');
        })
    },
    async passchange(req, res){
        if(!req.params.id || !req.body.password) return views.error.code(res, 'ERR_09');
        let id = req.params.id;

        // Buscamos el usuario por id 
        let consulta = await usersModel.get(id, true, req);
        if(!consulta) return views.error.code(res, 'ERR_08');
        let update = new usersModel({
            id: id,
            password: req.body.password
        })
        update.update().then(v => {
            if(v) return views.success.update(res)
            else return views.error.code(res, 'ERR_11');
        })
    }
}

module.exports = controller;
