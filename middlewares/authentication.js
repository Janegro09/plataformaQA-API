/**
 * @fileoverview Middleware | Middleware de autenticacion que valida token
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
const jwt           = require('jsonwebtoken');
const password_hash = require('password-hash');
const Users         = require('../models/users');
const Tokens        = require('../database/migrations/tokenTable');
const views         = require('../views');
const helper        = require('../controllers/helper')
const cfile         = helper.configFile();
const Roles         = require('../models/roles')
const Groups         = require('../models/groups')

const routesPath    = cfile.mainInfo.routes;
const TOKEN_PASS    = cfile.mainInfo.jwtPass;

class Auth {

    constructor(user) {
        this.user = user;
        return true;
    }

    /**
     * Esta funcion genera un token con los datos de usuario, con una valides de 1 hora (60*60) y almacena el token referido a un userID, o sino lo actualiza
     */
    async generarToken() {
        let tokenData = {
            id: this.user.id,
            email: this.user.email
        }
        let token = jwt.sign(tokenData,TOKEN_PASS,{
            expiresIn: 60 * 60 // Expires in 1 hour
        })
        let consulta = await Tokens.findOne({userId: this.user.id});
        if(!consulta){
            // generamos un registro nuevo
            let c = new Tokens({
                userId: this.user.id,
                token: token
            })
            c.save()
        }else{
            // Actualizamos el existente
            let c = await Tokens.updateOne({_id: consulta.id},{
                token: token
            })
            if(c.nModified == 0) return false;

        }
        return token;
    }
    /**
     * Esta funcion consulta si la ruta ingresada existe en routeNotToken de config.json, solicita el token, verifica que sea el mismo al de la base de datos,
     * si es el mismo entonces permitira el acceso y recogera el userId del token, ya que si el token es el mismo que el almacenado entonces significa que nadie lo
     * altero, por lo tanto el userID que trae dentro del token es el indicado
     */
    static async checkToken(req, res, next) {
        let url = req.url;
        url = url.split('/')[3];
        if(cfile.routesNotToken.indexOf(url) === -1) {
            var token   = req.headers.authorization;
            if(!token) return views.error.code(res,'ERR_04');
            token = token.split(" ");
            if(token[0] != 'Bearer') return views.error.code(res,'ERR_04');

            jwt.verify(token[1], TOKEN_PASS, async (err, t) => {
                if(err) return views.error.code(res,'ERR_04');
                let user = await Users.get(t.id);
                // checkamos que el token almacenado a ese usuario sea el mismo
                let c = await Tokens.findOne({token: token[1]})
                if(!c || !(c.userId == t.id)) return views.error.code(res,'ERR_05');

                // Asignamos un nuevo token
                let newToken    = new Auth(user[0]);
                user[0].token   = await newToken.generarToken();
                req.authUser = user;
                res.authUser = user;
                next();            
            })
        }else{
            next();
        }
    }
}

module.exports = Auth;