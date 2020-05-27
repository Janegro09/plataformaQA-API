/**
* @fileoverview Type: Controller | Controlador de grupos de usuarios
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
const Groups         = require('../models/groups');
const Permit        = require('../models/permissions')

const controller = {
    async get(req, res) {
        let auth = await Permit.checkPermit(req,"Puede consultar grupos de usuarios");
        if(!auth) return views.error.code(res, 'ERR_04');
        try{
            let c = await Groups.get(req.params.id);
            if(!c) return views.error.code(res, "ERR_07");
            return views.customResponse(res,true,200,"",c);
        }catch(e) {
            return views.error.code(res,'ERR_15')
        }
    },
    async new (req, res) {
        let auth = await Permit.checkPermit(req,"Puede agregar grupos de usuarios");
        if(!auth) return views.error.code(res, 'ERR_04');
        if(req.params.id !== 'new') return views.error.code(res, 'ERR_09');
        let group = new Groups({group: req.body.group});
        group = await group.save();
        if(!group) return views.error.code(res, 'ERR_16');
        else return views.success.create(res);
    },
    async delete(req, res) {
        let auth = await Permit.checkPermit(req,"Puede eliminar grupos de usuarios");
        if(!auth) return views.error.code(res, 'ERR_04');
        Groups.delete(req.params.id).then(v => {
            if(!v) return views.error.code(res,"ERR_14");
            else views.success.delete(res);
        }).catch(e => {
            return views.error.message(res,e);
        })
    },
    async update(req, res) {
        let auth = await Permit.checkPermit(req,"Puede actualizar grupos de usuarios");
        if(!auth) return views.error.code(res, 'ERR_04');
        let c = new Groups({
            id: req.params.id,
            group: req.body.group
        });
        c.update().then(v => {
            if(!v) return views.error.code(res, "ERR_11");
            else return views.success.update(res);
        })
    }
}

module.exports = controller;
