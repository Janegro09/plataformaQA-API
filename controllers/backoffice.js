/**
 * @fileoverview Type: Controller | Controlador de backoffice
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
const files         = require('./files');
const csvtojson     = require('csvtojson');
const views         = require('../views');
const Permit        = require('../models/permissions')
const logSchema     = require('../database/migrations/logNomina');

// Incluimos los modulos para la informacion del dashboard
const partituresModule = require('../modules/analytics/models/partitures');

const models = {
    users: require('../models/users'),
    groups: require('../models/groups'),
    roles: require('../models/roles')
}

const controller = {
    /**
     * Metodo desde la ruta que valida el archivo e inicia la imortacion del archivo
     */
    importNomina: async (req, res) => {

        if(!req.files) return views.error.code(res, 'ERR_09'); 
        if(!req.files.file) return views.error.code(res, 'ERR_09'); 
        const file = req.files.file;

        if(file.mimetype != "text/csv") return views.error.code(res, 'ERR_17'); 

        // Verificamos que los campos necesarios se encuentren correctamente
        const required = [
            "Legajo",
            "Sexo",
            "Mail",
            "Activo",
            "Estado",
            "Fecha Ingreso Linea",
            "Fecha de Baja",
            "Motivo de Baja",
            "Propiedad",
            "Canal",
            "Negocio",
            "Razon Social",
            "Edificio Laboral",
            "Nombre Gerencia 1",
            "Nombre G1",
            "Nombre Gerencia 2",
            "Nombre G2",
            "JefeCoordinador",
            "Responsable",
            "Supervisor",
            "Lider",
            "Provincia",
            "Region",
            "Subregion",
            "Equipo Especifico",
            "Punto de Venta",
            "Turno",
            "CUIL",
            "Nombre",
            "Funcion",
            "Detalle de Funcion",
            "Empresa"
        ];

        const archivo = new files(req);
        let c = await archivo.save();

        c = await csvtojson({}).fromFile("../files/" + c.url);
        let columnasExistentes = [];
        for(let x in c[0]){
            columnasExistentes.push(x);
        }

        // Consultamos que todas las required existan sino retornamos false
        let requiredFields = true;
        required.map(v => {
            if(columnasExistentes.indexOf(v) === -1) {
                requiredFields = false;
            }
        })

        if(requiredFields) {
            controller.import(c, archivo, req);
            return views.customResponse(res, true, 200, "Los registros comenzaron a actualizarse, en breve recibira un mail con los resultados");
        }else{
            archivo.delete();
            return views.error.code(res, 'ERR_18'); 
        }

    },
    /**
     * Metodo para importar todos los usuarios desde la nomina 
     * @param {Object} req Objeto req completo para extraer el archivo .csv
     */
    import: async (c, archivo = false, req = false) => {
        let tempData, user, group, agregados = 0, fallaron = 0;

        for(let i = 0; i < c.length; i++){
            if(!c[i]['Legajo'] && !c[i]['Mail']) continue;
            // No agregamos los usuarios pertenecientes a 365
            if(c[i]['Empresa'] == '365') continue;
            tempData = new UserNomina(c[i]);
            tempData = await tempData.getUserInfo();
            user     = new models.users(tempData);
            user     = await user.saveOrUpdate()
            if(!user) {
                fallaron++
            }
            else agregados++;;
        }

        if(req && archivo){
            // Enviamos el mail con la notificacion de finalizacion
            let mailContain = "";
            mailContain     += `<h3>Actualizacion de nomina en ${helper.configFile().projectInformation.project}</h3>`;
            mailContain     += `<br><p>Se agregaron o modificaron: <strong>${agregados} usuarios</strong></p>`;
            mailContain     += `<br><p>Fallaron: <strong>${fallaron} usuarios</strong></p>`;
            let mail = new helper.sender([req.authUser[0].email],`Actualizacion de nomina en ${helper.configFile().projectInformation.project}`,mailContain);
            mail.send().then(ok => console.log(ok), err => console.log(err));

            archivo.delete();
        }
        
        // Registramos en el log
        let log = new logSchema({
            method: req && archivo ? "Manual" : "Script Automatico",
            uAgregados: agregados,
            uFallados: fallaron
        })
        log.save().then(ok => {ok}).catch(err => {err})

    },
    exports: async (req, res) => {

    },
    dashboard: async (req, res) => {
        let dataReturn = {};
        const datosDashboard = {
            perfilamientos: true
        }
        if(req.authUser.length > 0){
            const usuarioLogeado = req.authUser[0];
            
            // Datos de mis perfilamientos
            if(datosDashboard.perfilamientos){
                dataReturn.misPerfilamientos = await partituresModule.getPartitureInfoByUser(usuarioLogeado.idDB);
            }
        } 
        return views.customResponse(res, true, 200, "datos del usuario logeado", dataReturn);
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

    /**
     * Prepara un objeto principal con la sintaxis del schema users.
     * Prepara todos los campos como por ejemplo convertir un unico nombre en nombre y apellido y el CUIL en dni
     */
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

        /**
         * A los usuarios que tengan canal ```PRESENCIAL``` y pertenezcan a la empresa TECO entonces el grupo sera Equipo Especifico
         */
        if(this.obj['Canal'] == 'PRESENCIAL' && this.obj['Empresa'] == 'TECO'){
            this.obj['Empresa'] = this.obj['Equipo Especifico'];
        }


        // Definimos los parametros estaticos
        this.usuario.legajo             = "u" + this.obj['Legajo'];
        this.usuario.sexo               = this.obj['Sexo'].toLowerCase();
        this.usuario.email              = this.obj['Mail'].toLowerCase();
        this.usuario.activeUser         = this.obj['Activo'].toLowerCase() === 'true' && this.obj['Estado'].toLowerCase() === 'activo' ? true : false 
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