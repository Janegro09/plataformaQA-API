/**
 * @fileoverview Modulo analytics | Modelo para partituras
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

const includes = require('../../includes');

// Schemas
const helper = require('../helper');

const cuartilesGroupsModel = require('./cuartilesGroups');

// Schemas
const partituresSchema = require('../migrations/partitures.table');
const instancesSchema = require('../migrations/instancesOfPartitures.table');
const stepsSchema = require('../migrations/stepsOfInstances.table');
const infobyPartitureSchema = require('../migrations/partituresInfoByUsers.table');
const partituresInfoByUsersTable = require('../migrations/partituresInfoByUsers.table');
const partituresFilesSchema = require('../migrations/filesByPartitures.table');
const perfilamientoFile = require('./perfilamientoFile');

const programsModel = require('../../programs/models/programs');
const stepsOfInstancesTable = require('../migrations/stepsOfInstances.table');
const filesByPartituresTable = require('../migrations/filesByPartitures.table');
const instancesOfPartituresTable = require('../migrations/instancesOfPartitures.table');

class Partitures {
    constructor(reqObject) {
        this.file = reqObject.fileId || false;
        this.fileData = [];
        this.expirationDate = reqObject.expirationDate || false;
        this.perfilamientosAssignados = reqObject.perfilamientosAsignados || false;
        this.instances = reqObject.instances || false;
        this.users = [];
    }

    async create() {
        try {
            /** Modificamos la estructura para crear multiples partituras */

            // Partitures --------------------------
            for(let f of this.file){
                let response = await cuartilesGroupsModel.getPerfilamientos(f, true, true);
                response.map(v => {
                    this.fileData.push(v);
                })
            }
            // Chequeamos la existencia de los perfilamientos asignados
            await this.getFileName();
            if (this.perfilamientosAssignados.length === 0 || !this.perfilamientosAssignados) throw new Error('No asigno perfilamientos')
            let partitureInfoByUser = [];


            for(let v of this.perfilamientosAssignados){
                let partitureExists = await this.checkPerfilamientoExistandAddUsers(v);
                if(!partitureExists) throw new Error('Error con el grupo de cuartiles que intenta agregar, puede ser que no exista o que ya este usandose para otra partitura.')
            }

            let partitureObject = {
                name: this.file.name,
                fileId: this.file.id,
                perfilamientos: this.perfilamientosAssignados
            }

            if (this.expirationDate) {
                partitureObject.expirationDate = this.expirationDate;
            }


            // Verificamos que no exista otra partitura con el mismo nombre
            // let findOtherPartitures = await partituresSchema.find({ name: partitureObject.name });
            // if(findOtherPartitures.length > 0) throw new Error('Ya existe otra partitura coin el archivo especificado');

            // Preparamos el registro
            partitureObject = new partituresSchema(partitureObject);
            for (let u = 0; u < this.users.length; u++) {

                // obtenemos el id del usuario
                let userDBid = await includes.users.model.getUseridDB(this.users[u].DNI)
                let infoUser = new infobyPartitureSchema({
                    partitureId: partitureObject._id,
                    userId: userDBid,
                    status: "pending",
                    cluster: this.users[u].Cluster,
                    detallePA: this.users[u]['DETALLE_PA'],
                    GCAssigned: this.users[u]['Grupos de cuartiles Asignados']
                })
                partitureInfoByUser.push(infoUser);
            }

            // Instances ---------------------------------
            let instances = [];
            let steps = [];
            for (let i = 0; i < this.instances.length; i++) {
                let instance = this.instances[i];
                let tempData = {
                    partitureId: partitureObject._id,
                    name: instance.name,
                    blockingDate: instance.blockingDate || false
                }
                if (instance.expirationDate) {
                    tempData.expirationDate = new Date(instance.expirationDate);
                }
                let c = new instancesSchema(tempData);
		        instances.push(c);
                // Steps --------------------------------------------
                for (let p = 0; p < instance.steps.length; p++) {
                    // Creamos un registro por cada usuario
                    for (let q = 0; q < this.users.length; q++) {
                        let user = this.users[q].DNI;
                        user = await includes.users.model.getUseridDB(user)
                        let b = new stepsSchema({
                            userId: user,
                            instanceId: c._id,
                            partitureId: partitureObject._id,
                            completed: false,
                            name: instance.steps[p].name,
                            requestedMonitorings: instance.steps[p].requiredMonitorings || 0
                        })

                        steps.push(b)
                    }
                }
            }
            // Guardamos todos los registros en la base de datos



            // // Info extra de partituras por usuarios
            let c = await infobyPartitureSchema.insertMany(partitureInfoByUser);
            if (c.length === 0) throw new Error('Error al crear el registro.CODE02')

            // // Partituras
            c = await partitureObject.save()
            if (!c) throw new Error('Error al crear el registro. CODE01')

            // // Instancias
            c = await instancesSchema.insertMany(instances);
            if (c.length === 0) throw new Error('Error al crear el registro. CODE03')

            // // Steps
            c = await stepsSchema.insertMany(steps);
            if (c.length === 0) throw new Error('Error al crear el registro. CODE04')

            return true;
        } catch (e) {
	    console.log(e);
            throw e;
        }
    }

    async getFileName() {
        if (!this.file) throw new Error('Archivo inexistente')
        let id = this.file;
        let data = {
            canal: [],
            empresa: [],
            mercado: [],
            seccion: [],
            plan: [],
            fecha: []
        }
        for(let f of this.file){
            let c = await includes.files.checkExist(f);
            if (!c) throw new Error('Archivo inexistente')
            c = c.name.split('.');
            c = c[0].split(' ');

            let x = 0;
            /**
             * Esta iteracion arma los nombres cuando las partituras se arman desde varios archivos, se hace para no repetir
             */
            for(let i in data) {
                if(!data[i].includes(c[x]) && c[x]){
                    data[i].push(c[x])
                }
                x++
            }
        }

        let nameReturn = "";

        for(let i in data){
            data[i].map(v => {
                nameReturn = nameReturn ? `${nameReturn} ${v}` : v
            })
        }

        this.file = {
            name: nameReturn,
            id
        };
        return true;
    }

    async checkPerfilamientoExistandAddUsers(object) {
        if (!object) return false;

        // Chequeamos que la partitura no este creada
        let partiture = await partituresSchema.find({fileId: {
            $in: object.fileId
        }});

        if(partiture.length === 0){
            partiture = false;
        }else {
            partiture = partiture[0].perfilamientos;
            for(let p of partiture){
                if(p.fileId === object.fileId && p.name === object.name) return false;
            }
        }

        for (let x = 0; x < this.fileData.length; x++) {
            let perfilamiento = this.fileData[x]
            if (perfilamiento.name === object.name && perfilamiento.fileId == object.fileId) {
                for (let u = 0; u < perfilamiento.usersAssign.length; u++) {
                    if (this.users.indexOf(perfilamiento.usersAssign[u]) >= 0) continue;
                    this.users.push(perfilamiento.usersAssign[u])
                }
                return true;
            }
        }

        return false;
    }

    /**
     * Funcion que devuleve los datos necesarios para armar un reporte
     * @returns { Object } Retorna toda la informacion sobre la partitura
     *  - Clusters disponibles
     *  - Instancias disponibles
     * @param {Number} id 
     */
    static async getPartitureInfo(id) {
        if(!id) throw new Error('Error en los parametros enviados');
        
        const where = { _id: id };
        const wherePartiture = { partitureId: id };
        const whereInstance = { partitureId: id }
        let data = {
            clusters: [],
            instances: []
        }
        // Consultamos si existe la partitura
        let partitures = await partituresSchema.find().where(where);
        if (partitures.length === 0) throw new Error('No existen registros en nuestra base de datos');

        let usersInfo  = await partituresInfoByUsersTable.find().where(wherePartiture);
        if(usersInfo.length === 0) throw new Error('No existen usuarios en esta partitura');

        usersInfo.map(v => (data.clusters.includes(v.cluster) || !v.cluster) || data.clusters.push(v.cluster));

        // Guardamos las instancias
        let instances = await instancesOfPartituresTable.find().where(whereInstance);

        for(let { _id:id, partitureId, name } of instances) {
            data.instances.push({ id, partitureId, name })
        }

        return data;
    }

    static async get(req) {
        const { id, userId, stepId } = req.params;
        let ReturnData = [];
        let where = {};
        let wherePartiture = "";
        let whereInstance = "";
        let whereStep = "";
        let users = [];
        let instances = [];
        let archivosPermitidos = [];
        let viewAllPartitures = false;
        let partitureInfoByUser = false;
        const userLogged = req.authUser[0] || false;

        // Permisos de visualizacion de contenido
        if (!userLogged.role.role) throw new Error('Error en el rol del usuario logeado')
        let viewresponsibleComments = false, viewmanagerComments = false, viewcoordinatorOnSiteComments = false, viewcoordinatorComments = false, viewcoordinatorOCComments = false, viewaccountAdministratorComments = false, viewcoachingComments = false;
        switch (userLogged.role.role) {
            case 'ADMINISTRATOR':
            case 'SUPERVISOR':
            case 'COORDINADOR':
                viewresponsibleComments             = true;
                viewmanagerComments                 = true;
                viewcoordinatorOnSiteComments       = true;
                viewcoordinatorComments             = true;
                viewcoordinatorOCComments           = true;
                viewaccountAdministratorComments    = true;
                viewcoachingComments                = true;
                break;
            case 'GERENTE':
                viewresponsibleComments             = true;
                viewmanagerComments                 = true;
                viewcoordinatorOnSiteComments       = true;
                viewcoordinatorComments             = true;
                viewcoordinatorOCComments           = true;
                viewaccountAdministratorComments    = false;
                viewcoachingComments                = false;
                break;
            case 'RESPONSABLE':
                viewresponsibleComments             = true;
                viewmanagerComments                 = true;
                viewcoordinatorOnSiteComments       = false;
                viewcoordinatorComments             = false;
                viewcoordinatorOCComments           = false;
                viewaccountAdministratorComments    = false;
                viewcoachingComments                = false;
                break;
            case 'LIDER':
                viewresponsibleComments             = true;
                viewmanagerComments                 = false;
                viewcoordinatorOnSiteComments       = false;
                viewcoordinatorComments             = false;
                viewcoordinatorOCComments           = false;
                viewaccountAdministratorComments    = false;
                viewcoachingComments                = false;
                break;
            case 'LIDER ON SITE':
                viewresponsibleComments             = true;
                viewmanagerComments                 = true;
                viewcoordinatorOnSiteComments       = true;
                viewcoordinatorComments             = true;
                viewcoordinatorOCComments           = true;
                viewaccountAdministratorComments    = false;
                viewcoachingComments                = false;
                break;
        }

        // Solo traemos las partituras disponibles por programa segun usuario
        if (req) {
            // comprobamos si es administrador
            let user = await includes.users.model.getUsersperGroup(req.authUser[0].id);
            if (user.indexOf('all') >= 0 || req.authUser[0].role.role === 'ADMINISTRATOR') {
                viewAllPartitures = true;
            } else {
                let programasPermitidos = await programsModel.get(req);
                for (let i = 0; i < programasPermitidos.length; i++) {
                    const programa = programasPermitidos[i].id;
                    let files = await programsModel.getFileswithPrograms(programa);
                    files.map(v => {
                        if (archivosPermitidos.indexOf(v) === -1) {
                            archivosPermitidos.push(v);
                        }
                    })
                }
            }
        }

        let [ sort, skip, limit ] = includes.helper.get_custom_variables_for_get_methods(req.query || {});


        if (id && userId && stepId) {
            // Retornamos informacion sobre un paso especifico
            where = { _id: id };
            wherePartiture = { partitureId: id, userId: userId };
            whereInstance = { partitureId: id }
            whereStep = { userId: userId, _id: stepId }
            partitureInfoByUser = true;
        } else if (id && userId) {
            // Retornamos una partitura especifica de un usuario
            where = { _id: id };
            wherePartiture = { partitureId: id, userId: userId };
            whereInstance = { partitureId: id }
            whereStep = { userId: userId }
            partitureInfoByUser = true;
        } else if (id) {
            // Retornamos una partitura
            where = { _id: id };
            wherePartiture = { partitureId: id };
            partitureInfoByUser = true;
        } else {
            // Agregamos parametros de busqueda
            const { q } = req.query;
            if(q) {
                where.name = { $regex: q, $options: 'i' };
            }

        }




        try {
            // Traemos todas las partituras o la partitura especifica segun where
            let partitures = await partituresSchema.find().where(where).skip(skip).limit(limit).sort(sort);
            if (partitures.length === 0) throw new Error('No existen registros en nuestra base de datos');
            const FileId = partitures[0].fileId;

            // Traemos los usuarios
            if (wherePartiture) {
                let partitureFileusers = await perfilamientoFile.getUserInfo(FileId);
                let u = await infobyPartitureSchema.find().where(wherePartiture);

                for (let x = 0; x < u.length; x++) {
                    let temp = await includes.users.schema.find({ _id: u[x].userId }).where({ userDelete: false });
                    if (temp.length === 0) continue;
                    let rowFromPartiture = "";
                    if (partitureInfoByUser) {
                        // Traemos la informacion agregada de la partitura
                        rowFromPartiture = partitureFileusers && partitureFileusers.filter(v => v.DNI == temp[0].id)
                        rowFromPartiture = rowFromPartiture.length > 0 ? rowFromPartiture[0] : false;
                    }

                    const { audioFilesRequired, audioFilesActually } = await this.getAudiosCountbyUser(temp[0]._id, wherePartiture.partitureId);

                    let user = {
                        idDB: temp[0]._id,
                        id: temp[0].id,
                        dni: temp[0].dni,
                        name: temp[0].name,
                        lastName: temp[0].lastName,
                        canal: temp[0].canal,
                        responsable: temp[0].responsable,
                        lider: temp[0].lider,
                        jefeCoordinador: temp[0].jefeCoordinador,
                        edificioLaboral: temp[0].edificioLaboral,
                        G1: temp[0].nameG1,
                        G2: temp[0].nameG2,
                        partitureStatus: u[x].status,
                        rowFromPartiture,
                        lastUpdate: [],
                        audioFilesRequired,
                        audioFilesActually,
                        improvment: u[x].improvment || false,
                        cluster: u[x].cluster || false

                    }

                    if (u[x].modifications.length > 0) {
                        let lastM = u[x].modifications;
                        let ordenado = lastM.sort((a, b) => b.date - a.date);
                        for (let x of ordenado) {
                            if (!x.section) continue;
                            if (!user.lastUpdate.find(element => element.section === x.section)) {
                                user.lastUpdate = [...user.lastUpdate, {
                                    user: x.id || false,
                                    date: x.date || false,
                                    section: x.section
                                }]
                            }
                        }
                    }
                    users.push(user);
                }
            }

            // Treamos las instancias
            if (whereInstance) {
                let ins = await instancesSchema.find().where(whereInstance);
                for (let i = 0; i < ins.length; i++) {
                    let instance = ins[i];
                    let tempData = {
                        id: instance._id,
                        name: instance.name,
                        blockingDate: instance.blockingDate,
                        dates: {
                            expirationDate: instance.expirationDate,
                            createdAt: instance.createdAt
                        },
                        steps: []
                    }

                    // Buscamos los steps
                    whereStep.instanceId = tempData.id
                    let steps = await stepsSchema.find().where(whereStep);
                    for (let s = 0; s < steps.length; s++) {
                        let st = steps[s];

                        // Buscamos archivos para ese step
                        let file = await partituresFilesSchema.find({ stepId: st._id, userId: userId });
                        file = file.length === 0 ? false : file;
                        let tData = {
                            id: st._id,
                            completed: st.completed,
                            name: st.name,
                            requestedMonitorings: st.requestedMonitorings,
                            assignedMonitorings: st.assignedMonitorings,
                            detalleTransaccion: st.detalleTransaccion,
                            patronMejora: st.patronMejora,
                            compromisoRepresentante: st.compromisoRepresentante,
                            fechaInforme: st.fechaInforme,
                            improvment: st.improvment,
                            audioFiles: file,
                            customFilesSync: st.customFilesSync,
                            resultadosRepresentante: st.resultadosRepresentante
                        }

                        if (viewresponsibleComments) {
                            tData.responsibleComments = st.responsibleComments;
                        }
                        if (viewaccountAdministratorComments) {
                            tData.accountAdministratorComments = st.accountAdministratorComments
                        }
                        if (viewcoachingComments) {
                            tData.coachingComments = st.coachingComments;
                        }
                        if (viewcoordinatorOnSiteComments) {
                            tData.coordinatorOnSiteComments = st.coordinatorOnSiteComments;
                        }
                        if (viewcoordinatorComments) {
                            tData.coordinatorComments = st.coordinatorComments;
                        }
                        if (viewcoordinatorOCComments) {
                            tData.coordinatorOCComments = st.coordinatorOCComments;
                        }
                        if (viewmanagerComments) {
                            tData.managerComments = st.managerComments;
                        }

                        tempData.steps.push(tData);
                    }

                    if (tempData.steps.length > 0) {
                        instances.push(tempData)
                    }


                }
            }

            for (let i = 0; i < partitures.length; i++) {
                let AccesoaArchivo = true;
                let partiture = partitures[i]
                /**
                 * Obtenemos el estado de la partitura dependiendo del valor de los usuarios
                 *
                 */
                let partitureStatus = null;
                let ps = await infobyPartitureSchema.find({ partitureId: partiture._id });
                for (let x of ps) {
                    if (x.status === 'run') {
                        partitureStatus = x.status;
                        break;
                    } else if (x.status === 'pending' && partitureStatus !== 'run' && partitureStatus !== 'finished') {
                        partitureStatus = x.status;
                    } else if (x.status === 'finished' && (!partitureStatus || partitureStatus === 'finished')) {
                        partitureStatus = x.status;
                    } else if (x.status === 'finished' && partitureStatus === 'pending') {
                        partitureStatus = 'run';
                        break;
                    } else if (x.status === 'pending') {
                        partitureStatus = 'run';
                        break;
                    }
                }
                for(let p of partiture.fileId){
                    if(!archivosPermitidos.includes(p)) {
                        AccesoaArchivo = false;
                    }
                }

                if (!viewAllPartitures && !AccesoaArchivo) continue;
                let grupoAssigned = "";

                for(let ga of partiture.perfilamientos) {
                    grupoAssigned += `${ga.name} `;
                }

                // Obtenemos las instancias para traer la fecha de vencimiento
                let endDate = await instancesSchema.find({ partitureId: partiture._id });
                if(endDate.length > 0){
                    endDate = endDate.sort((a, b) => b.expirationDate - a.expirationDate);
                    endDate = endDate[0].expirationDate;
                }

                let tempData = {
                    id: partiture._id,
                    name: partiture.name,
                    fileId: partiture.fileId,
                    partitureStatus,
                    perfilamientos: partiture.perfilamientos,
                    dates: {
                        createdAt: partiture.createdAt
                    },
                    grupoAssigned,
                    endDate,
                    users: users,
                    instances: instances
                }
                ReturnData.push(tempData)
            }

            return ReturnData;
        } catch (e) {
            throw e
        }

    }

    static async getPartitureInfoByUser(userId) {
        let dataReturn = [];
        if(userId){
            // Buscamos las partituras que tiene asignadas el usuario
            let partitures = await partituresInfoByUsersTable.find({userId});
            for(let p of partitures) {
                let c = await partituresSchema.find({_id: p.partitureId});
                let tempData = {
                    id: c._id,
                    name: c.name,
                    status: p.status,
                    imporvment: p.imporvment,
                    cantOfModifications: p.modifications.length,
                    cluster: p.cluster,
                    GCAssigned: p.GCAssigned,
                    createdAt: p.createdAt
                }
                dataReturn.push(tempData)
            }
        }
        return dataReturn;
    }

    static async delete(partitureId) {
        if (!partitureId) throw new Error('ID no especificado')

        // Buscamos si existe una partitura con ese id
        let partiture = await partituresSchema.find({ _id: partitureId });
        if (partiture.length === 0) throw new Error('Partitura inexistente')

        try {
            // eliminamos todos los registros
            // partitures
            await partituresSchema.deleteMany({ _id: partitureId });

            // instances
            let c = await instancesSchema.find({ partitureId: partitureId }); // obtenemos el id
            if (c.length === 0) throw new Error('No existen instancias para esta partitura');
            c.map(v => {
                // stepsofinstances
                stepsSchema.deleteMany({ instanceId: v._id }).then(v => {
                    v
                })
            })
            await instancesSchema.deleteMany({ partitureId: partitureId });

            // partitures info by users
            await partituresInfoByUsersTable.deleteMany({ partitureId: partitureId })

            // Eliminamos todos los archivos
            let filesToDelete = [];
            let files = await partituresFilesSchema.find({ partitureId: partitureId });
            files.map(file => {
                filesToDelete.push(file._id);
            })
            await this.deleteAudioFiles(filesToDelete);
            return true;

        } catch (e) {
            throw e
        }

    }

    static async modifySteps(arrayModifications) {
        if (arrayModifications.length === 0) throw new Error('Error en los parametros enviados')
        let error = false;
        const today = new Date();
        for (let i = 0; i < arrayModifications.length; i++) {
            const { id, userId, stepId, modify, userLogged } = arrayModifications[i];

            // Chequeamos que exista ese step
            let c = await stepsSchema.find({ _id: stepId, userId: userId });
            if (c.length === 0) return false;

            // consultamos si se vencio y si es modificable
            let instance = await instancesOfPartituresTable.find({_id: c[0].instanceId});
            if(instance.length === 0) return false;
            instance = instance[0];

            let vencido = instance.expirationDate < today;
            let blockingDate = instance.blockingDate || false;

            if(vencido && blockingDate) throw new Error('No puede modificar ya que la fecha de vencimiento es bloqueante');


            if(!c[0].fechaInforme){
                // Si no tiene fecha de informe se la agregamos
                modify.fechaInforme = Date.now();
            }

            if (modify.improvment) {
                let improvment = modify.improvment;
                const acceptedValues = ['+', '+-', '-', 'n/a'];
                if (acceptedValues.includes(improvment)) {
                    await infobyPartitureSchema.updateOne({ partitureId: id, userId }, {
                        improvment
                    })
                }
            }

            // Chequeamos que los audios que envia existan
            if(modify.customFilesSync) {
                let files = [];
                for(let audio of modify.customFilesSync){
		            let id = audio;
		            if(typeof audio === 'object') {
			            id = audio.id
                    } 
                    let search = await includes.files.checkExist(id);
                    if(search) {
                        files.push(audio);
                    }                
                }

                modify.customFilesSync = files;
            }

            modify.last_modification = today;

            c = await stepsSchema.updateOne({ _id: stepId, userId: userId }, modify)
            if (c.ok === 0) {
                error = true;
            }

            // Chequeamos si estan todos los campos entonces ponemos el estado como true
            let stepStatus = await stepsSchema.find({_id: stepId});
            let audiosRequeridos = await this.getAudiosCountbyUser(userId, id, stepId )
            if(stepStatus.length > 0) {
                let s = stepStatus[0];
                if(s.detalleTransaccion && audiosRequeridos.audioFilesRequired === audiosRequeridos.audioFilesActually) {
                        c = await stepsSchema.updateOne({ _id: stepId, userId: userId }, {completed: true})
                    }
            }

            // Chequeamos si todos los estados de los steps es completed entonces cambiamos el estado de la partitura a finished
            let stepsStatus = await stepsSchema.find({userId, partitureId: id});
            let modifiyPartitureStatus = {
                finished: 0,
                notFinished: 0
            }
            for(let j of stepsStatus) {
                if(j.completed === false) {
                    modifiyPartitureStatus.notFinished++
                } else {
                    modifiyPartitureStatus.finished++
                }
            }
            if(modifiyPartitureStatus) {
                let temp;
                if(modifiyPartitureStatus.notFinished === 0 && modifiyPartitureStatus.finished > 0) {
                    temp = 'finished';
                } else {
                    temp = 'run'
                }
                await this.changePartitureStatus(id, userId, temp);
            }

            await this.addModificationforUser(id, userId, userLogged)


        }

        

        if (error) return false;
        else return true;
    }

    static async uploadFile(reqObject) {
        if (!reqObject) throw new Error('Error en los parametros enviados');
        const { stepId, id, file, userId, section, message } = reqObject;

        // Comprobamos la existencia del stepID
        let c = await stepsSchema.find({ _id: stepId, userId: userId });
        if (c.length === 0) return false;

        let insertData = {
            partitureId: id,
            stepId,
            userId,
            section
        }

        if(file){
            insertData.fileId = file;
        }else if(message){
            insertData.message = message;
        }else throw new Error('Debe especificar un archivo o un mensaje')

        // Almacenamos el audio o el mensaje
        let f = new partituresFilesSchema(insertData);
        f = await f.save();
        if (!f) return false;
        return true;
    }

    static async deleteAudioFiles(arrayIds) {
        if (!arrayIds) return false;
        for (let i = 0; i < arrayIds.length; i++) {
            const id = arrayIds[i]

            // Consultamos el nombre del archivo
            let c = await partituresFilesSchema.find({ _id: id });
            if (c.length === 0) throw new Error('Registro inexistente')

            if(c[0].fileId){
                let deleteFile = new includes.files(c[0].fileId);
                deleteFile = await deleteFile.delete();
                if (!deleteFile) throw new Error('Error al eliminar el archivo')
            }
            c = await partituresFilesSchema.deleteOne({ _id: id });
            if (c.deletedCount === 0) {
                throw new Error('Error al eliminar el registro')
            }


        }
        return true;
    }

    static async changePartitureStatus(partitureId, userId, status) {
        if (!partitureId || !userId || !status) throw new Error('Error en los parametros enviados')

        // Buscamos la partitura y el usuario
        let userRequest = await partituresInfoByUsersTable.find({ partitureId: partitureId, userId: userId });
        if (userRequest.length === 0) throw new Error(`El usuario ${userId}, no esta asignado a la partitura ${partitureId}`);

        // Si el estado es finished entonces no modificamos nada
        if (userRequest[0].status !== 'finished') {
            const aceptedStatus = [
                'finished',
                'run',
                'pending'
            ]
            if (!aceptedStatus.includes(status)) throw new Error('Solo se aceptan los estados que aparecen en la documentación de la API. Por favor, revisela!')

            let updateRequest = await partituresInfoByUsersTable.updateOne({ partitureId: partitureId, userId: userId }, { status: status });
            if (updateRequest.ok > 0) return true;
            else return false;
        } else {
            return true;
        }

    }

    static async addModificationforUser(partitureId, userId, loggedUser) {
        if (!partitureId || !userId) throw new Error('Error en los parametros enviados');

        let userRequest = await partituresInfoByUsersTable.find({ partitureId, userId });
        if (userRequest.length === 0) throw new Error(`El usuario ${userId}, no esta asignado a la partitura ${partitureId}`);

        let modifications = [...userRequest[0].modifications, {
            idDB: loggedUser.idDB,
            id: loggedUser.id,
            date: Date.now(),
            section: loggedUser.role.role
        }]

        let updateRequest = await partituresInfoByUsersTable.updateOne({ partitureId, userId }, {modifications
        });

        if (updateRequest.ok > 0) return true;
        else return false;
    }

    static async getAudiosCountbyUser(userId, partitureId, stepId = false) {
        let dataReturn = {
            audioFilesRequired: 0,
            audioFilesActually: 0
        }
        if(userId && partitureId) {
            let where = {
                userId,
                partitureId
            }
            if(stepId) {
                where._id = stepId;
            }
            // Buscamos los steps segun la instancia y el usuario
            let steps = await stepsOfInstancesTable.find().where(where);
            for(let s of steps) {
                dataReturn.audioFilesRequired += s.requestedMonitorings;
            }

            where = {
                partitureId,
                userId,
                section: 'monitorings'
            }

            if(stepId) {
                where.stepId = stepId;
            }
            let files = await filesByPartituresTable.find().where(where);
            dataReturn.audioFilesActually = files.length
        }
        return dataReturn;
    }

    static async getFileId (id, userId, stepId, fileId) {
        if(!id || !userId || !stepId || !fileId ) throw new Error('IDs no especificados');

        // Buscamos el archivo
        let file = await filesByPartituresTable.find({userId, partitureId: id, stepId, _id: fileId});
        if(file.length === 0) throw new Error('Archivo inexistente');

        file = file[0].fileId;

        let tempId = await includes.files.getTempURL(file);

        return tempId;
    }
}

module.exports = Partitures;
