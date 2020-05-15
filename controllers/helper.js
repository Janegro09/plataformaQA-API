const fs            = require('fs');
const path          = require('path');
const files         = require('../database/migrations/Files');
const nodeMailer    = require('nodemailer');

var controller = {
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
                regEx   = /^([A-Za-z]{1,15})+( [A-Za-z]{1,15})?$/;
                exp     = new RegExp(regEx);
                return exp.test(value);
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
    objectSize: (obj) => {
        return Object.keys(obj).length
    },
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
        loggedUser: (user, token) => {
            return {
                id: user.id,
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                dni: user.dni,
                role: user.role,
                imagen: user.imagen,
                token: token ? token : user.token
            }
        }        
    },
    files:{
        delete: (path) => {
            try{
                fs.unlinkSync(path);
                return true;
            }catch (e) {
                return false;
            }
        },
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
        unix: () => {
            return Math.round((new Date()).getTime() / 1000);
        },
        mySqltoDate: (date) => {
            let obj = new Date(Date.parse(date));
            return `${obj.getDate()}/${obj.getMonth() + 1}/${obj.getFullYear()}`;
        }
    },
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
                to: "",
                html: this.text
            }
            let enviados = 0;
            for(let x = 0; x < this.to.length; x++){
                mailOptions.to = this.to[x];
                this.transporter.sendMail(mailOptions, (err, info) => {
                    if(!err) enviados++;
                })
            }
            return true;
        }


    }
}

module.exports = controller;