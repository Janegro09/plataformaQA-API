/**
 * @fileoverview Type: Controller | Controlador general de funciones de ayuda
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
const fs            = require('fs');
const path          = require('path');
const files         = require('../database/migrations/Files');
const nodeMailer    = require('nodemailer');
const Roles         = require('../models/roles')
const Groups         = require('../models/groups')

module.exports = {
    /**
     * Esta funcion checkea el tipo de valor en comparacion con expresiones regulares
     * @param {mixed} value valor para validar
     * @param {Integer} type 
     *  1 - Solo numeros (max 7 caracteres)
     *  2 - empty
     *  3 - Emails
     *  4 - Planes de Personal (TECO) 
     */
    regExCheck: (value,type) => {
        let regEx, exp;
        switch(type){
            case 1:
                // SOLO PARA NUMEROSS
                regEx   = /^([0-9]{1,7})$/;
                exp     = new RegExp(regEx);
                return exp.test(value);
                // id regex
            break;
            case 2:
                return true;
            break;
            case 3:
                regEx   = /^([A-Za-z0-9\.\_\-]{1,20})+@+([a-z]{1,15})+(\.[a-z]{1,4})+(\.[a-z]{1,3})?$/;
                exp     = new RegExp(regEx);
                return exp.test(value);
            break; 
            case 4:
                // caso solo para planes de personal
                regEx   = /^([A-Za-z]{1,6})$/;
                exp     = new RegExp(regEx);
                return exp.test(value);
            break;
        }
    },
    /**
     * Funcion que envia una fecha y convienrte en GMT 0
     * @param {*} date 
     */
    date_to_UTCDate: (date) => {
        console.log("fecha1: "+date)

        // date = new Date(date);
        // const horas_resta = date.getUTCHours();
        // const resta = (((60 * 60) * horas_resta) * 1000);
        
        // date = Date.parse(date);
        // console.log("fecha2: "+ date)
        // return new Date(date - resta);
        return date;
    },
    objectSize: (obj) => {
        return Object.keys(obj).length
    },
    /**
     * Get config.json
     */
    configFile: () => {
        let configFile = JSON.parse(fs.readFileSync("./config.json"));
        return configFile;
    },
    users: {
        getLevel(id) {
            let base = JSON.parse(fs.readFileSync('./database/json/userLevels.json'));
            let level = base.filter((value) => {
                if (value.ID == id) return true;
            })
            return level[0].NOMBRE;
        },
        /**
         * Object return for loggedUser
         */
        loggedUser: (user, token) => {
            return {
                token: token ? token : user.token,
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                sexo: user.sexo,
                email: user.email,
                dni: user.dni,
                role: user.roleInfo || user.role,
                group: user.group,
                imagen: user.imagen
            }
        },
        /**
         * Convierte un nombre en nombre y apellido
         * @param {String} fullName Nombre completo separado por espacios
         * 
         * @returns {Object} {name,lastName}
         */
        convertNametoFullName: (fullName) => {
            if(!fullName) return false;
            let name = "", lastName = "";
            fullName = fullName.split(" ");
            switch (fullName.length){
                case 1: // Entonces esta mal la sintaxis, asique devuelve el mismo valor en nombre y en apellido
                    lastName    = fullName[0];
                    name        = fullName[0];
                break;
                case 2: // Entonces tiene 1 apellido y 1 nombre
                    lastName    = fullName[0];
                    name        = fullName[1];
                break;
                case 3: // Entonces tiene 1 apellido y 2 nombres
                    lastName    = fullName[0];
                    name        = fullName[1] + " " + fullName[2];
                break;
                case 4: // Entonces tiene 2 apellidos y 2 nombres
                    lastName    = fullName[0] + " " + fullName[1];
                    name        = fullName[2] + " " + fullName[3];
                break;
                default: 
                    if(fullName.length > 4){
                        // Entonces los dos primeros son apellidos y los demas son nombres
                        lastName = fullName[0] + " " + fullName[1];
                        for(let i = 2; i < fullName.length; i++){
                            name += name !== "" ? " " : "";
                            name += fullName[i];
                        }
                    }else if(fullName.length === 0){
                        return false;
                    }
                break;
            }

            return {
                name: name,
                lastName: lastName
            }
        },
        /** Convierte un nombre en nombre y apellido
        * @param {String} cuil Cuil completo de 11 o 10 caracteres - Solo valido para Argentina
        * 
        * @returns {Object} {cuil,dni}
        */
        convertCUILtoDNI: (cuil) => {
            if(!cuil) return false;
            let dataReturn = {
                cuil: cuil,
                dni: 0
            }
            if(cuil.length === 11 || cuil.length === 10){
                // Entonces porque es un CUIL
                dataReturn.dni = cuil.substr(2,8);
            }else if(cuil.length < 10 && cuil.length >= 8){
                // Entonces porque es un DNI
                dataReturn.dni = cuil;
            }else{
                dataReturn.dni = cuil;
            }
            return dataReturn;
        }      
    },
    get_custom_variables_for_get_methods: ({ order = 'DESC', orderBy = 'createdAt', limit = 50, offset = 0 }) => {
        let sort_return    = {};
        let skip_return    = 0;
        let limit_return   = 50;

        sort_return[orderBy] = order === "ASC" ? 1 : -1;
        skip_return         = parseInt(offset) || 0;
        limit_return        = parseInt(limit)  || 50;

        if(limit_return > 300) {
            limit_return = 50;
        }

        return [ sort_return, skip_return, limit_return ];
    },
    files:{
        /**
         * Eliminar archivo
         * @param {String} path Ruta del archivo a eliminar
         */
        delete: (path) => {
            try{
                fs.unlinkSync(path);
                return true;
            }catch (e) {
                return false;
            }
        },
        /**
         * Consulta si el archivo existe
         * @param {String} path Ruta del archivo o directorio a consultar
         * @param {Boolean} checkDir true si consulta si es un directorio
         */
        exists: (path, checkDir = false) => {
            try{
                let c = fs.statSync(path);
                return checkDir ? c.isDirectory() : c.isFile();
            }catch (e) {
                return false;
            }
        },
        deleteUploaded: (id) => {
            // Este metodo elimina el registro en la base de datos y en los archivos
            return new Promise((res, rej) => {
                files.findById(id).then((v) => {
                    controller.files.delete('../files/' + v.url);
                    files.deleteOne({_id: id}).then((r) => {
                        if(r.deletedCount > 0) res(true);
                        else res(false)
                    })
                }).catch((e) => {
                    res(false);
                })
            })
        }
    },
    dates: {
        /**
         * Devuelve fecha actual en formato UNIX
         */
        unix: () => {
            return Math.round((new Date()).getTime() / 1000);
        },
        /**
         * Convierte DATE to dd/mm/YYYY
         * @param {Date} date
         */
        mySqltoDate: (date) => {
            let obj = new Date(Date.parse(date));
            return `${obj.getDate()}/${obj.getMonth() + 1}/${obj.getFullYear()}`;
        }
    },
    /**
     * Sender de mails 
     */
    sender: class {
        constructor(to,subject = "Soluciones Digitales Telecom Argentina", text = "Sin contenido") {
	    if(!to) return false;
            this.transporter = nodeMailer.createTransport(controller.configFile().sender.mail); 
            this.from = '"Soluciones Digitales Telecom S.A." <recursosysoluciones2019@gmail.com>';
            this.to = to;
            this.subject = subject;
            this.text = text;
        }

        async send() {
            let mailOptions = {
                from: this.from,
                subject: this.subject,
                to: this.to,
                html: this.text
            }
            this.transporter.sendMail(mailOptions, (err, info) => {
                   if(err) return false;
                   else return true;
            })
        }


    }
}
