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
const Users         = require('../models/users');
const Tokens        = require('../database/migrations/tokenTable');
const views         = require('../views');
const helper        = require('../controllers/helper')
const cfile         = helper.configFile();
const Roles         = require('../models/roles')
const fs            = require('fs');

const routesPath    = cfile.mainInfo.routes;
// const TOKEN_PASS    = cfile.mainInfo.jwtPass;
const TOKEN_PASS    = fs.readFileSync('token.key','utf-8');
const cert          = fs.readFileSync('token.pub','utf-8');

module.exports = class Auth {

    constructor(user) {
        this.user = user;
        this.expiration_token = (60 * 60) * 12;
        return true;
    }

    /**
     * 
     * Esta funcion elimina todos los tokens que ya no tienen validez
     *  
     */
    async deleteOldTokens() {

        let c = await Tokens.find({ userId: this.user.id });
        let deleteToken = [];
        let now = Date.parse(new Date);
        for(let token of c) {
            try {
                await jwt.verify(token.token,cert, { algorithms: ["RS256"] });

            } catch (e) {
                deleteToken.push(token.id)
            }
            
        }
        await Tokens.deleteMany({ _id: { $in: deleteToken } });
    }

    /**
     * Esta funcion genera un token con los datos de usuario, con una valides de 1 hora (60*60) y almacena el token referido a un userID, o sino lo actualiza
     */
    async generarToken(sessionId = false) {
        let tokenData = {
            id: this.user.id,
            email: this.user.email,
            sessionId: sessionId || (Date.parse(new Date)).toString() + this.user.id
        }
        let token = jwt.sign(tokenData,TOKEN_PASS,{
            algorithm: 'RS256',
            expiresIn: ((60 * 60) * 16) // Expires in 4 hour
        })
        let consulta = await Tokens.findOne({ userId: this.user.id, sessionId: tokenData.sessionId });
        
        if(!sessionId) { // Eliminamos los tokens invalidos solo cuando inicia sesión
            await this.deleteOldTokens();
        }
        
        if(!consulta){
            // generamos un registro nuevo
            let c = new Tokens({
                userId: this.user.id,
                token: token,
                sessionId: tokenData.sessionId
            })
            c.save();
        }else{
            // Actualizamos el existente
            token = consulta.token;
            /**
             * Vamos a dejar de actualizar el token por cada request por pedido de multipestaña
             */
            // await Tokens.updateOne({ _id: consulta.id },{
            //     token: token
            // })
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
        if(url && url.indexOf('?') !== -1){
            url = url.split('?')[0];
        }
        if(cfile.routesNotToken.indexOf(url) === -1) {
            var token   = req.headers.authorization;
            if(!token) return views.error.code(res,'ERR_04');
            token = token.split(" ");
            if(token[0] != 'Bearer') return views.error.code(res,'ERR_04');
            jwt.verify(token[1], cert, { algorithms: ["RS256"] }, async (err, t) => {
                if(err) return views.error.code(res,'ERR_04');
                let user = await Users.get(t.id);
                // checkamos que el token almacenado a ese usuario sea el mismo
                let c = await Tokens.findOne({token: token[1]})
                if(!c || !(c.userId == t.id)) return views.error.code(res,'ERR_05');

                // Asignamos un nuevo token
                let newToken    = new Auth(user[0]);
                user[0].token   = await newToken.generarToken(t.sessionId);
                req.authUser = user;
                res.authUser = user;
                next();            
            })
        }else{
            next();
        }
    }
}
