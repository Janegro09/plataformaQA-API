const helper        = require('./helper');
const views         = require('../views');
const Roles         = require('../models/roles');

var controller = {
    get: (req, res) => {
        let id = req.params.id ? req.params.id : "";
        Roles.get(id, true).then(response => {
            return views.customResponse(res,true,200,"",response);
        },err => {
            return views.error.message(res, err);
        })
    },
    new: (req, res) => {
        if(req.params.id !== 'new' || !req.body.role || !req.body.permissions) return views.error.code(res,'ERR_09');
        let c = new Roles(req.body);
        c.save().then(v => {
            if(!v) return views.error.code(res, "ERR_12");
            else return views.success.create(res);
        }, e => {
            return views.error.message(res, e);
        })
    },
    delete: (req, res) => {
        if(!req.params.id) return views.error.code(res,"ERR_09");
        Roles.delete(req.params.id).then(response => {
            if(!response) return views.error.code(res,"ERR_09");
            else return views.success.delete(res);
        },err => {
            return views.error.message(res, err)
        })
    },
    update: (req, res) => {
        if(!req.params.id) return views.error.code(res,"ERR_09");

        let c = new Roles({
            role: req.body.role,
            permissions: req.body.permissions,
            id: req.params.id
        });
        c.update().then(response => {
            if(response) return views.success.update(res);
            else return views.error.code(res, 'ERR_11');
        }, err => views.error.message(res, err))
    },
    getPermissions(req, res) {
        Roles.getPermission().then(v => {
            return views.customResponse(res, true, 200, "", v);
        })
    }
}

module.exports = controller;