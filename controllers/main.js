/**
 * @fileoverview Controller | Controlador principal de rutas ubicadas en routes/main.js
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
const Users         = require('../models/users');
const Auth          = require('../middlewares/authentication');
const Roles         = require('../models/roles')
const Groups         = require('../models/groups')
const Permit        = require('../models/permissions')
const fetch         = require('node-fetch');
const { request } = require('express');


var controller = {
    principalView: (req, res) => {
        let ini = "<h1>API en desarrollo y testing <strong style='color:#f00;'>*los datos son ficticios*</strong></h1>";
        ini += "<h4>Desarrollador: Ramiro Macciuci &copy; &reg;</h4>"
        ini += "<h4>Cel: +54 11 2174 2416 | ramimacciuci@gmail.com</h4>"
        return res.status(200).send(ini);
    },
    test: (req, res) => {
        return views.success.test(res);
    },
    frontUtilities: async (req, res) => {
        // Listamos las bases necesarias para front
        let returnData = {
            groups: [],
            roles: []
        }
        // Enviamos Grupos
        returnData.groups = await Groups.get();
        // Enviamos Roles
        returnData.roles= await Roles.get();

        return views.customResponse(res,true,202,"",returnData)
    },
    getPublicFile: (req, res) => {
        let section = req.params.section;
        let type = req.params.type;
        let file   = req.params.file;
        let url    = `../files/${section}/${type}/${file}`;
        if(helper.files.exists(url)){
           views.success.file(res,url);
        }else{
           views.success.file(res,'public/notFound.jpg');
        }
    },
    login: async (req, res) => {
        const {user, password} = req.body;
        // Solo pedimos recaptcha si esta en produccion
        // if(process.env.ENVRIORMENT != 'development'){
        //     if(req.body.user === undefined || req.body['g-recaptcha-response'] === undefined || req.body.password === undefined){
        //         return views.error.message(res,'Error en los parametros enviados');
        //     }
        //     const recaptcha = req.body['g-recaptcha-response'];
        //     const urlGoogle = "https://www.google.com/recaptcha/api/siteverify";
        //     const SecretGoogleCaptcha = "6Lc_kQEVAAAAAC4geSN7f-zIhtK0oeZbE9nkWOFp"
            
        //     const params = new URLSearchParams();
        //     params.append('secret', SecretGoogleCaptcha);
        //     params.append('response', recaptcha);

        //     // Consultamos valides de recaptcha
        //     let googleQuery = await fetch(urlGoogle, {
        //         method: 'POST',
        //         body: params
        //     })
        //     googleQuery = await googleQuery.json();
        //     if(!googleQuery.success) return views.error.message(res,'Error con captcha de google');
        // }
        try{
            if(user == undefined || password == undefined) return views.error.code(res,'ERR_01');
            let consulta = await Users.checkUserPassword(user,password);
            // Asignamos Token
            let token = new Auth(consulta[0]);
            consulta[0].roleInfo = await Roles.get(consulta[0].role,true)
            // if(consulta[0].roleInfo[0].permissionAssign === false) return views.error.code(res, "ERR_17")
            consulta[0].group = await Groups.getUserGroupsName(consulta[0]._id)
            token = await token.generarToken();
            if(!token) return views.error.code(res,'ERR_03');
            else return views.customResponse(res,true,202,"",{},helper.users.loggedUser(consulta[0],token))
        }catch (e) {
            return views.error.message(res, e.message);
        }
    }

}

module.exports = controller;