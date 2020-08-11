/**
 * @fileoverview Models | Modelo para usuarios
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
const helper                = require('../controllers/helper');
const password_hash         = require('password-hash');
const userSchema            = require('../database/migrations/usersTable');
const files                 = require('../database/migrations/Files');
const Roles                 = require('../models/roles');
const Groups                = require('../models/groups');
const groupsSchema          = require('../database/migrations/groups');
const userLoginSchema       = require('../database/migrations/usersLogin');



/**
 * Clase para manejar usuarios 
 */
class Users {
    constructor(userObject = {}){
        this.id                 = userObject.id                 ? userObject.id                               : false;        
        this.name               = userObject.name               ? userObject.name.toUpperCase()               : false;
        this.lastName           = userObject.lastName           ? userObject.lastName.toUpperCase()           : false;
        this.role               = userObject.role               ? userObject.role                             : false;
        this.dni                = userObject.dni                ? userObject.dni                              : false;
        this.cuil               = userObject.cuil               ? userObject.cuil                             : false;
        this.password           = userObject.password           ? password_hash.generate(userObject.password) : false;
        this.legajo             = userObject.legajo             ? userObject.legajo                           : false;
        this.userActive         = userObject.userActive         ? userObject.userActive                       : true;
        this.email              = userObject.email              ? userObject.email                            : false;
        this.phone              = userObject.phone              ? userObject.phone                            : false;
        this.imagen             = userObject.imagen             ? userObject.imagen                           : false;
        this.sexo               = userObject.sexo               ? userObject.sexo                             : false;
        this.status             = userObject.status             ? userObject.status                           : false;
        this.fechaIngresoLinea  = userObject.fechaIngresoLinea  ? userObject.fechaIngresoLinea                : false;
        this.fechaBaja          = userObject.fechaBaja          ? userObject.fechaBaja                        : false;
        this.motivoBaja         = userObject.motivoBaja         ? userObject.motivoBaja                       : false;
        this.propiedad          = userObject.propiedad          ? userObject.propiedad                        : false;
        this.canal              = userObject.canal              ? userObject.canal                            : false;
        this.negocio            = userObject.negocio            ? userObject.negocio                          : false;
        this.razonSocial        = userObject.razonSocial        ? userObject.razonSocial                      : false;
        this.edificioLaboral    = userObject.edificioLaboral    ? userObject.edificioLaboral                  : false;
        this.gerencia1          = userObject.gerencia1          ? userObject.gerencia1                        : false;
        this.nameG1             = userObject.nameG1             ? userObject.nameG1                           : false;
        this.gerencia2          = userObject.gerencia2          ? userObject.gerencia2                        : false;
        this.nameG2             = userObject.nameG2             ? userObject.nameG2                           : false;
        this.jefeCoordinador    = userObject.jefeCoordinador    ? userObject.jefeCoordinador                  : false;
        this.responsable        = userObject.responsable        ? userObject.responsable                      : false;
        this.supervisor         = userObject.supervisor         ? userObject.supervisor                       : false;
        this.lider              = userObject.lider              ? userObject.lider                            : false;
        this.provincia          = userObject.provincia          ? userObject.provincia                        : false;
        this.region             = userObject.region             ? userObject.region                           : false;
        this.subregion          = userObject.subregion          ? userObject.subregion                        : false;
        this.equipoEspecifico   = userObject.equipoEspecifico   ? userObject.equipoEspecifico                 : false;
        this.puntoVenta         = userObject.puntoVenta         ? userObject.puntoVenta                       : false;
        this.group              = userObject.group              ? userObject.group                            : false;
        this.turno              = userObject.turno              ? userObject.turno                            : false;
    }

    /**
     * Metodo creado para la creacion o actualizacion de usuarios provenientes de la nomina
     * consulta si el usuario existe segun ID, o sino lo crea
     */
    async saveOrUpdate () {
        if(!this.id) return false;
        // Consultamos si el usuario existe
        let c = await userSchema.find({id: this.id});
        let data = {};
        for (let x in this){
            if((c.length > 0 && x == 'dni') || (c.length > 0 && x == 'cuil') || (c.length > 0 && x == 'id') || (c.length > 0 && x == 'password')) continue;
            if(c.length > 0 && x == 'role') {
                const { roleModifiedByNomina } = c[0];
                if(roleModifiedByNomina === false) continue;
            }
            if(this[x] !== false || x == 'userActive'){
                data[x] = this[x];
            }
        }
        if(c.length === 0){
            // entonces creamos el nuevo usuario
            data.createdAt = Date.now();
            let d = new userSchema(data);
            try {
                if(data.group){                    
                    await Groups.assignUserGroup(d._id, data.group);
                }
                c = await d.save();
                if(c.id) return true;
                else return false;
            }catch (e) {
                return false;
            }

        }else {
            // Entonces modificamos el usuario
            try {
                if(data.group){
                    /**ATENCIOOOOOOOOOOOOOOOOOOOOOON!
                     * 
                     * Desactivamos esta funcion para que no elimine todos los grupos del usuario y los asigne como estan en la nomina, ya que se les resetean los mismos en cada actualizacion diaria
                     * 
                     */
                    // await Groups.assignUserGroup(c[0]._id, data.group);
                }
                data.updatedAt = Date.now();
                c = await userSchema.updateOne({_id: c._id},data);
                if(c.ok > 0){
                    return true;
                }else{
                    return false;
                }
                
            }catch (e) {
                return false;
            }
        }
    }

    /**
     * Guarda un usuario
     */
    async save() {
        // Preparamos el objeto de usuario
        let data = {};
        for (let x in this){
            if(this[x] !== false || x == 'userActive'){
                data[x] = this[x];
            }
        }
        if(data.name == undefined ||
            data.lastName == undefined ||
            data.id == undefined ||
            data.email == undefined ||
            data.role == undefined || 
            data.dni == undefined) return false;
        // Consultamos que el rol exista
        let rol = await Roles.get(data.role, true);
        if(rol.length == 0 || !rol) return false;

        if(!data.group){
            let group = await groupsSchema.find({group: 'General'});
            data.group = group[0]._id;
        }

        if(data.sexo) {
            data.sexo = data.sexo == 'FEMENINO' || data.sexo == 'MASCULINO' ? data.sexo : "";
        }

        if(data.turno) {
            data.turno = data.turno == 'TT' || data.turno == 'TM' ? data.turno : "";
        }
        
        // Consultamos que no exista user con ese id o email
        let consulta = await userSchema.find().where({id: data.id, email: data.email});
        if(consulta.length > 0) return false; 
        data.createdAt = Date.now();

        // Asignamos una contraseña y la enviamos por mail
        //let password = `${data.name}${data.id}`;
        let password = 'Telecom01';
        data.password = password_hash.generate(password);

        // Creamos el nuevo usuario
        let d = new userSchema(data);
        

        // Le asginamos los grupos
        if(data.group){
            //Groups.assignUserGroup(d._id, data.group);
        }

        try {
            let c = await d.save();
            if(c.id != undefined){
                let mailContain = "";
                mailContain += `<h3>Registro en ${helper.configFile().projectInformation.project}</h3>`;
                mailContain += `<br><p>Usuario: <strong>${data.id}</strong></p>`;
                mailContain += `<br><p>Pwd: <strong>${password}</strong></p>`;
                mailContain += `<br><br><p>Link de acceso: http://plataformaqa.solucionesdigitalesteco.com.ar</p>`;
                mailContain += '<br><br><br><strong style="color: #f00;">Solicitamos que cambie su contraseña lo antes posible</strong>';
                let mail = new helper.sender(data.email,`Nuevo registro en ${helper.configFile().projectInformation.project}`,mailContain);
                mail.send().then(ok => ok);
                return true;
            }else{
                return false;
            }
        }catch (e) {
            return false;
        }
    }

    /**console.log(c);
     * Modifica un usuario existente
     */
    async update() {
        let data = {};
        for(let x in this){
            if(x == 'id' || x == "dni" || x == "cuil") continue;
            if(this[x] !== false){
                data[x] = this[x];
            }
        }

        // Consultamos que el usuario exista
        let resultado = await Users.get(this.id);
        if(resultado.length == 0) return false;

        if(this.imagen !== false && resultado[0].imagen){
            await helper.files.deleteUploaded(resultado[0].imagen._id);
        }
        // Verificamos si el rol existe 
        if(data.role){
            let rol = await Roles.get(data.role, true);
            if(!rol) return false;
            data.roleModifiedByNomina = false;
        }

        if(data.sexo) {
            data.sexo = data.sexo == 'FEMENINO' || data.sexo == 'MASCULINO' ? data.sexo : "";
        }

        if(data.turno) {
            data.turno = data.turno == 'TT' || data.turno == 'TM' ? data.turno : "";
        }

        // Verificamos si existe el grupo
        if(data.group){
            await Groups.assignUserGroup(resultado[0].idDB, data.group);
        }
        // if(data.group) {
        //     data.group = (await Groups.get(data.group))._id;
        // }
        data.updatedAt = Date.now();
        let c = await userSchema.updateOne({"id": this.id},data);
        if(c.ok > 0){
            return await Users.get(this.id, false);
        }else{
            return false;
        }
    }

    /**
     * Modifica el estado de un usuario
     * @param {String} id 
     */
    static async userChangeStatus(id = 0){
        if(id == 0) return false;
        let c = await userSchema.findOne().where({userDelete: false, id: id})
        if(!c) return false;
        let status = c.userActive;
        let data = {};
        data.userActive = status ? false : true;
        let x = await userSchema.updateOne({_id: c._id},data)
        if(x.nModified == 0) return false;
        else return true;
    }

    /**
     * HardDelete a usuario
     * @param {String} id
     */
    static async userDelete(id) {
        if(id == 0 || !id) return false;
        let c = await userSchema.findOne().where({userDelete: false, id: id})
        if(!c) return false;
        let data = {
            userDelete: true
        }
        let x = await userSchema.updateOne({_id: c._id},data)
        if(x.nModified == 0) return false;
        else return true;
    }

    /**
     * Devuelve un array de todos los usuarios que pertenecen a uno o mas grupos que el userID, esta funcion se usa cuando un usuario especifico solicita la lista
     * de todos los usuarios, esta devolvera los IDs de los usuarios que les devolvera.
     * @param {String} userId 
     */
    static async getUsersperGroup(userId){
        if(!userId) return false;
        // Buscamos el usuario, si tiene rol develop o admin entonces muestra todos
        let consulta = await userSchema.find({id: userId});
        if(consulta[0].role == 'Develop') return ['all'];
        let role = await Roles.get(consulta[0].role);
        if(role[0].role == 'Administrator') return ['all'];

        // Buscamos los grupos al que pertenece el usuario
        consulta = await Groups.getUserGroups(consulta[0]._id, false);
        let gruposOrigen = [];
        for(let x = 0; x < consulta.length; x++){
            gruposOrigen.push(consulta[x].groupId);
        }
        let usuariosPermitidos = [];
        for(let x = 0; x < gruposOrigen.length; x++){
            consulta = await Groups.getUserGroups(false, gruposOrigen[x]);
            for(let q = 0; q < consulta.length; q++){
                if(usuariosPermitidos.indexOf(consulta[q]) === -1){
                    usuariosPermitidos.push(consulta[q]);
                }
            }
        }

        return usuariosPermitidos;

    }

    /**
     * Verifica la password y el usuario
     * @param {String} user 
     * @param {String} password 
     */
    static async checkUserPassword(user, password){
        let consulta = await userSchema.find({id: user, userDelete: false});
        if(!consulta.length) throw new Error('Usuario inexistente');
        if(!consulta[0].userActive) throw new Error('Usuario bloqueado o inactivo. Comuniquese con el administrador.');
        // Consultamos si el usuario tiene permiso
        let consultaInicio = await this.checkAttemptsLogin(consulta[0]);
        if(!consultaInicio) throw new Error('Debido a los intentos reiterados de inicio de sesion, su cuenta ha sido bloqueada.');
        let originPass = consulta[0].password;
        if(!password_hash.verify(password, originPass)) throw new Error('Contraseña Erronea');
        else {
            this.restartCountAttempts(consultaInicio);
            return consulta;
        };
    }

    /**
     * Devuelve la informacion del usuario
     * @param {mixed} id 
     * @param {Boolean} allData Trae toda la data del usuario
     * @param {Object} req Objeto REQ con el que devolvera la cantidad de usuarios permitidos por el usuario logedo
     *  
     * @example userModel.get("ramimacciuci@gmail.com").then((v) => {
                    console.log(v);
                })
     */
    static async get(id = 0, allData = true, req = false){
        let where = {};
        let returnData = [], roleTotal = false;
        let specificData = false;
        /**
         * Solo listamos los usuarios que estan asignados a los mismos grupos que el usuario que consulta, salvo que sea con rol Administrator o Develop
         */
        if(req){
            let usuariosPermitidos = await Users.getUsersperGroup(req.authUser[0].id);
            if(usuariosPermitidos[0] !== 'all' && usuariosPermitidos.length > 0){
                where._id = {
                    $in: usuariosPermitidos
                }
            }else if(usuariosPermitidos[0] !== 'all' || usuariosPermitidos.length === 0 || !usuariosPermitidos){
                return false;
            }

            // Consultamos si traer data especifica
            if(req.query !== undefined && req.query.specificdata === 'true'){
                specificData = true;
            }
        }
        
        
        where.userDelete = false;

        if(!allData){
            where.role = {
                $not: /^Develop$/
            };
        }
        if(helper.regExCheck(id,3)){
            // devuelve todos los usuarios
            where.email = id;
        }else if(id != 0){
            // Trae usuario especifico por id
            where.id = id;
            roleTotal = true;
        }
        let respuesta = await userSchema.find().where(where);
        if(respuesta.length == 0) return false;
        let img, userObject, role = "", group = "";
        for(let y = 0; y < respuesta.length; y++){
            // Solo mostramos data especifica
            if(!specificData){
                if(id != 0){
                    if(respuesta[y].imagen){
                        img = await files.findById(respuesta[y].imagen);
                        respuesta[y].imagen = global.completeUrl + helper.configFile().mainInfo.routes + '/files/' + img.url;
                    }
                    role    = await Roles.get(respuesta[y].role,roleTotal);
                    group   = await Groups.getUserGroupsName(respuesta[y]._id);
                }
            
                var {
                    fechaIngresoLinea,
                    cuil,
                    legajo,
                    sexo,
                    status,
                    fechaBaja,
                    motivoBaja,
                    propiedad,
                    canal,
                    negocio,
                    edificioLaboral,
                    gerencia1,
                    nameG1,
                    gerencia2,
                    nameG2,
                    equipoEspecifico,
                    puntoVenta,
                    turno,
    
                } = respuesta[y];
                userObject = {
                    idDB: respuesta[y]._id,
                    id: respuesta[y].id,
                    name: respuesta[y].name,
                    lastName: respuesta[y].lastName,
                    dni: respuesta[y].dni,
                    fechaIngresoLinea :                     fechaIngresoLinea,
                    cuil: cuil,
                    legajo : legajo,
                    sexo : sexo,
                    status : status,
                    fechaBaja : fechaBaja,
                    motivoBaja : motivoBaja,
                    propiedad : propiedad,
                    canal : canal,
                    negocio : negocio,
                    edificioLaboral : edificioLaboral,
                    gerencia1 : gerencia1,
                    nameG1 : nameG1,
                    gerencia2 : gerencia2,
                    nameG2 : nameG2,
                    equipoEspecifico : equipoEspecifico,
                    puntoVenta : puntoVenta,
                    turno : turno,
                    group: group,
                    role: role[0],
                    razonSocial: respuesta[y].razonSocial,
                    jefeCoordinador: respuesta[y].jefeCoordinador,
                    responsable: respuesta[y].responsable,
                    supervisor: respuesta[y].supervisor,
                    lider: respuesta[y].lider,
                    provincia: respuesta[y].provincia,
                    region: respuesta[y].region,
                    subregion: respuesta[y].subregion,
                    email: respuesta[y].email,
                    phone: respuesta[y].phone == null ? false : respuesta[y].phone,
                    userActive: respuesta[y].userActive,
                    imagen: respuesta[y].imagen == "" ? false : img,
                    dates: {
                        created: helper.dates.mySqltoDate(respuesta[y].createdAt),
                        updated: helper.dates.mySqltoDate(respuesta[y].updatedAt)
                    }
                }
            }else {
                userObject = {
                    idDB: respuesta[y]._id,
                    id: respuesta[y].id,
                    name: respuesta[y].name,
                    lastName: respuesta[y].lastName
                }
            }
            returnData.push(userObject)
            if(returnData.length == respuesta.length){
                return returnData;
            }
        } 

    }

    /**
     * Esta funcion sirve para consultar la cantidad de inicios de sesion de un usuario
     * que sumara uno al intento, o devolvera false en caso que se hayan superado los numero de intentos
     * @param {object} userID especificamos el id del usuario a verificar 
     */
    static async checkAttemptsLogin(userID) {
        // Consultamos si el usuario tiene permiso de inciar sesion
        let c = await userLoginSchema.find({userId: userID._id});
        let idReturn;
        if(c.length === 0) {
            // Usuario nunca inicio sesion
            c = new userLoginSchema({
                userId: userID._id,
                NofAttempts: 1
            });
            idReturn = c._id
            await c.save();
        }else{
            if(c[0].NofAttempts < 5){
                // Suma un intento
                await userLoginSchema.updateOne({_id: c[0]._id}, {
                    NofAttempts: c[0].NofAttempts + 1
                })
                idReturn = c[0]._id;
            }else{
                // Inactiva el usuario
                await userSchema.updateOne({_id: userID._id},{
                    userActive: false
                })
                this.restartCountAttempts(c[0]._id);
                return false;
            }
        }
        return idReturn;
    }

    /**
     * Esta funcion volvera el contador de inicio de sesion a 0 ya que el usuario pudo
     * logearse correctamente.
     * @param {object} registerId id del registro de usuario 
     */
    static restartCountAttempts(registerId) {
        userLoginSchema.updateOne({_id: registerId}, {
            NofAttempts: 0
        }).then(v => {v})
    }

    static async getUseridDB(id){
        let idReturn = id;
        // Buscamos el id
        let c = await userSchema.find({id: id});
        if(c.length > 0){
            idReturn = c[0]._id;
        }
        return idReturn;
    }
}

module.exports = Users;
