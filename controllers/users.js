const helper        = require('./helper');
const views         = require('../views');    
const usersModel    = require('../models/users');
const FileUpload    = require('./files');
const Permit        = require('../models/permissions');

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
        let User = new usersModel({
            name: req.body.name,
            lastName: req.body.lastName,
            email: req.body.email,
            role: req.body.role,
            id: req.body.id,
            phone: req.body.phone,
            dni: req.body.dni,
            group: req.body.group,
            imagen: img ? img.id : false
        })
        let c = await User.save();
        if(!c) return views.error.code(res,'ERR_10');
        else{
            return views.customResponse(res, true, 200, "", c)
        }
    },
    async get(req, res) {
        // Registamos route
        // let auth = await Permit.checkPermit(req,"Puede consultar usuarios");
        // console.log(auth);
        let id = req.params.id ? req.params.id : 0;

        let users;
        try{
            users = await usersModel.get(id,false);
            if(users.length == 0) return views.error.code(res, 'ERR_07');
            else{
                views.customResponse(res,true,200,"",users);
            }    
        }catch{
            return views.error.code(res, 'ERR_08');
        }
    },
    delete(req, res) {
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
    diabled: (req, res) => {
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
        let consulta = await usersModel.get(id);
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
