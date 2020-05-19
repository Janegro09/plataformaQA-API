const helper        = require('../controllers/helper');
const password_hash = require('password-hash');
const userSchema    = require('../database/migrations/usersTable');
const files         = require('../database/migrations/Files');
const Roles         = require('../models/roles');
const Groups        = require('../models/groups');

/**
 * Clase para manejar usuarios 
 * 
 * Si en el constructor se especifica ID entonces va a modificar sobre 
 */
class Users {
    constructor(userObject = {}){
        this.id                 = userObject.id                 ? userObject.id                               : false;        
        this.name               = userObject.name               ? userObject.name                             : false;
        this.lastName           = userObject.lastName           ? userObject.lastName                         : false;
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

    async saveOrUpdate () {
        if(!this.id) return false;
        // Consultamos si el usuario existe
        let c = await userSchema.find({id: this.id});
        let data = {};
        for (let x in this){
            if((c.length > 0 && x == 'dni') || (c.length > 0 && x == 'cuil') || (c.length > 0 && x == 'id')) continue;
            if(this[x] !== false || x == 'userActive'){
                data[x] = this[x];
            }
        }
        if(c.length === 0){
            // entonces creamos el nuevo usuario
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
                    await Groups.assignUserGroup(c[0]._id, data.group);
                }
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
     * Sirve para crear o modificar un usuario
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
            data.role == undefined) return false;
        // Consultamos que el rol exista
        let rol = await Roles.get(data.role, true);
        if(rol.length == 0) return false;

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
        if(data.group){
            await Groups.assignUserGroup(d._id, data.group);
        }
        let c = await d.save();
        if(c.id != undefined){
            let mailContain = "";
            mailContain += `<h3>Registro en ${helper.configFile().projectInformation.project}</h3>`;
            mailContain += `<br><p>Usuario: <strong>${data.id}</strong></p>`;
            mailContain += `<br><p>Pwd: <strong>${password}</strong></p>`;
            mailContain += `<br><br><p>Link de acceso: https://plataformaQA.com.ar${helper.configFile().mainInfo.routes }/login</p>`;
            mailContain += '<br><br><br><strong style="color: #f00;">Solicitamos que cambie su contraseña lo antes posible</strong>';
            let mail = new helper.sender([data.email],`Nuevo registro en ${helper.configFile().projectInformation.project}`,mailContain);
            mail.send().then(ok => ok);
            return await Users.get(c.id,false);
        }else{
            return false;
        }
    }

    async update() {
        let data = {};
        for(let x in this){
            if(x == 'id' || x == 'email') continue;
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
        }

        // Verificamos si existe el grupo
        if(data.group){
            await Groups.assignUserGroup(this.id, data.group);
        }
        // if(data.group) {
        //     data.group = (await Groups.get(data.group))._id;
        // }
        let c = await userSchema.updateOne({"id": this.id},data);
        if(c.ok > 0){
            return await Users.get(this.id, false);
        }else{
            return false;
        }
    }

    
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

    static async checkUserPassword(user, password){
        let consulta = await userSchema.find({id: user});
        if(!consulta) return false;
        let originPass = consulta[0].password;
        if(!password_hash.verify(password, originPass)) return false;
        else return consulta;
    }

    /**
     * 
     * @param {mixed} id 
     * 
     * @example userModel.get("ramimacciuci@gmail.com").then((v) => {
                    console.log(v);
                })
     */
    static async get(id = 0, allData = true, req = false){
        let where = {};
        let returnData = [], roleTotal = false;
        /**
         * Solo listamos los usuarios que estan asignados a los mismos grupos que el usuario que consulta, salvo que sea con rol Administrator o Develop
         */
        // if(req){
        //     let usuariosPermitidos = await Users.getUsersperGroup(req.authUser[0].id);
        //     if(usuariosPermitidos[0] !== 'all' && usuariosPermitidos.length > 0){
        //         where._id = {
        //             $in: usuariosPermitidos
        //         }
        //     }else if(usuariosPermitidos[0] !== 'all' || usuariosPermitidos.length === 0 || !usuariosPermitidos){
        //         return false;
        //     }
        // }
        
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
            if(id != 0){
                if(respuesta[y].imagen){
                    img = await files.findById(respuesta[y].imagen);
                    respuesta[y].imagen = global.completeUrl + helper.configFile().mainInfo.routes + '/files/' + img.url;
                }
                role = await Roles.get(respuesta[y].role,roleTotal);
                group = await Groups.getUserGroups(respuesta[y]._id);

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
                    turno
                } = respuesta[y];
            }
            userObject = {
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
                role: role[0],
                email: respuesta[y].email,
                phone: respuesta[y].phone == null ? false : respuesta[y].phone,
                userActive: respuesta[y].userActive,
                imagen: respuesta[y].imagen == "" ? false : img,
                dates: {
                    created: helper.dates.mySqltoDate(respuesta[y].createdAt),
                    updated: helper.dates.mySqltoDate(respuesta[y].updatedAt)
                }
            }
            returnData.push(userObject)
            if(returnData.length == respuesta.length){
                return returnData;
            }
        } 

    }
}

module.exports = Users;
 