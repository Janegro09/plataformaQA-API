const helper        = require('./helper');
const files         = require('./files');
const csvtojson     = require('csvtojson');
const views         = require('../views');

const models = {
    users: require('../models/users'),
    groups: require('../models/groups'),
    roles: require('../models/roles')
}

const controller = {
    importNomina: (req, res) => {
        if(!req.files) return views.error.code(res, 'ERR_09'); 
        if(!req.files.file) return views.error.code(res, 'ERR_09'); 
        const file = req.files.file;

        if(file.mimetype != "text/csv") return views.error.code(res, 'ERR_17'); 

        controller.import(req);

        return views.customResponse(res, true, 200, "Los registros comenzaron a actualizarse, en breve recibira un mail con los resultados");

    },
    import: async (req) => {

        const archivo = new files(req);
        let c = await archivo.save();
        c = await csvtojson({}).fromFile("../files/" + c.url);
        let tempData, user, group, agregados = 0, fallaron = 0;
        for(let i = 0; i < c.length; i++){
            if(!c[i]['Legajo'] && !c[i]['Mail']) continue;

            // No agregamos los usuarios pertenecientes a 365
            if(c[i]['Empresa'] == '365') continue;

            tempData = new UserNomina(c[i]);
            tempData = await tempData.getUserInfo();
            user     = new models.users(tempData);
            user     = user.saveOrUpdate().then(user => {
                if(!user) {
                    fallaron++
                }
                else agregados++;
            })
        }
        let mailContain = "";
        mailContain     += `<h3>Actualizacion de nomina en ${helper.configFile().projectInformation.project}</h3>`;
        mailContain     += `<br><p>Se agregaron o modificaron: <strong>${agregados} usuarios</strong></p>`;
        mailContain     += `<br><p>Fallaron: <strong>${fallaron} usuarios</strong></p>`;
        let mail = new helper.sender(['ramimacciuci@gmail.com'],`Actualizacion de nomina en ${helper.configFile().projectInformation.project}`,mailContain);
        mail.send().then(ok => console.log(ok), err => console.log(err));
        
        // Enviamos el mail con la notificacion de finalizacion

        archivo.delete();
    }
}

/**
 * Devuelve los campos para insertar como un usuario
 */
class UserNomina {
    constructor(obj) {
        this.obj = obj;
        this.usuario = {};
    }

    async getUserInfo() {
        // Convertimos el nombre a nombre y apellido
        this.usuario = helper.users.convertNametoFullName(this.obj['Nombre']);

        // Convertimos el cuil a DNI
        let i = helper.users.convertCUILtoDNI(this.obj['CUIL']);
        for(let x in i){
            this.usuario[x] = i[x];
        }

        // Definimos el ID
        this.usuario.id = i.dni;

        // Definimos los parametros estaticos
        this.usuario.legajo             = "u" + this.obj['Legajo'];
        this.usuario.sexo               = this.obj['Sexo'].toLowerCase();
        this.usuario.email              = this.obj['Mail'].toLowerCase();
        this.usuario.activeUser         = this.obj['Activo'].toLowerCase() === 'true' ? true : false 
        this.usuario.status             = this.obj['Estado'].toLowerCase();
        this.usuario.fechaIngresoLinea  = this.obj['Fecha Ingreso Linea'];
        this.usuario.fechaBaja          = this.obj['Fecha de Baja'];
        this.usuario.motivoBaja         = this.obj['Motivo de Baja'];
        this.usuario.propiedad          = this.obj['Propiedad'];
        this.usuario.canal              = this.obj['Canal'];
        this.usuario.negocio            = this.obj['Negocio'];
        this.usuario.razonSocial        = this.obj['Razon Social'];
        this.usuario.edificioLaboral    = this.obj['Edificio Laboral'];
        this.usuario.gerencia1          = this.obj['Nombre Gerencia 1'];
        this.usuario.nameG1             = this.obj['Nombre G1'];
        this.usuario.gerencia2          = this.obj['Nombre Gerencia 2'];
        this.usuario.nameG2             = this.obj['Nombre G2'];
        this.usuario.jefeCoordinador    = this.obj['JefeCoordinador'];
        this.usuario.responsable        = this.obj['Responsable'];
        this.usuario.supervisor         = this.obj['Supervisor'];
        this.usuario.lider              = this.obj['Lider'];
        this.usuario.provincia          = this.obj['Provincia'];
        this.usuario.region             = this.obj['Region'];
        this.usuario.subregion          = this.obj['Subregion'];
        this.usuario.equipoEspecifico   = this.obj['Equipo Especifico'];
        this.usuario.puntoVenta         = this.obj['Punto de Venta'];
        this.usuario.turno              = this.obj['Turno'];
        this.usuario.password           = 'Telecom01';
        this.usuario.role               = await models.roles.getornewRol(this.obj['Funcion'],this.obj['Detalle de Funcion']); 
        this.usuario.group              = await models.groups.getorcreateGroup(this.obj['Empresa']);
        return this.usuario;
    }
}

module.exports = controller;