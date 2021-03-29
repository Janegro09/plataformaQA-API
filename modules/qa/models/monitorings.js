/**
 * @fileoverview Modulo QA
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

const formsModel = require('../../forms/models/forms');
const monSchema = require('../migrations/monitorings.table');
const Program = require('../../programs/models/programs');
const filesofMonitoringsTable = require('../migrations/filesofMonitorings.table');
const customFieldModel = require('../../forms/models/customfields');
const helper = require('../../../controllers/helper');

const existingStatus = ['pending', 'run', 'finished'];

class Monitoring {
    _improvment = "";

    constructor(data) {
        const { userId, transactionDate, caseId, programId, createdBy } = data;
    
        this.userId             = userId            || false;
        this.transactionDate    = transactionDate   || false;
        this.caseId             = caseId            || false;
        this.programId          = programId         || false;
        this.createdBy          = createdBy         || false;
        this.customSections     = "";

    }

    set improvment (improvment) {

        const permitedValues = ["++","+","+-","-"];

        if(permitedValues.includes(improvment)) {
            this._improvment = improvment;
        }
    }

    get improvment () {
        return this._improvment;
    }

    async save() {

        const requiredValues = ["userId", "transactionDate", "caseId", "programId", "createdBy"];
        for(let t in this) {
            if(requiredValues.includes(t) && !this[t]) throw new Error('Error en los parametros enviados');
        }

        // Consultamos si existe algun monitoreo con ese case id y por lo tanto ya se le asigno un formulario
        let existForm = await monSchema.find({ caseId: this.caseId });
        let customSections;
        if(existForm.length === 0) {

            // Entonces creamos un form nuevo segun el programa
            // Buscamos el formulario asignado a el programa
            customSections = await formsModel.getFormByProgram(this.programId);
            if(!customSections) throw new Error('Formulario inexistente, error interno de api');
            this.customSections = await Monitoring.getFormWithStr(customSections.parts);


        } else {
            // Entonces agarramos el primer caso y agarramos el formulario, total todos tienen asignado el mismo form
            this.customSections = existForm[0].customSections

        }
        // Chequeamos el id del usuario
        let user = await includes.users.schema.find({id: this.userId});
        if(!user) throw new Error('Usuario inexistente, verifique el ID especificado');

        // Chequeamos si existe un monitoreo ocn el mismo  caseId y createdBy
        let exist = await monSchema.find({ caseId: this.caseId, createdBy: this.createdBy });
        if(exist.length > 0) throw new Error('No puede existir mas de un monitoreo sobre el mismo caso y mismo usuario creador');

        let c = new monSchema(this);

        let save = await c.save();
        if(save) return c;
        else return false;
    }

    static async getFormWithStr(customSections) {
        if(!customSections) throw new Error('CustomSections undefined');
        
        
        return JSON.stringify(customSections)
        // Buscamos cada custom section

        // for(let section of customSections) {
        //     let td = {
        //         name: section.name,
        //         id: section._id,
        //         customFields: [] 
        //     }

        //     for(let cf of section.customFields) {
        //         console.log(cf.customField);
        //         let question = {
        //             question: cf.question,
        //             id: cf._id,
        //             customField: ""
        //         }

        //         let customField = await customFieldModel.get(cf.customField);
        //         if(customField.length === 0) continue;

        //         question.customField = customField[0]

        //         // console.log(question)
        //         td.customFields.push(question);
        //     }
        //     returnData.push(td);
        // }
        // return JSON.stringify(returnData);
    }

    static async saveFile (id, req = false) {
        if(!id) throw new Error('ID no especificado para subir el archivo, error interno');
        else if(!req) throw new Error('No se envió ningun archivo');

        // Comporbamos si existe el monitoreo
        let exist = await monSchema.findById(id);
        if(!exist) throw new Error('Monitoreo inexistente, error interno');
        let file = new includes.files(req)
        file = await file.save();

        const { caseId } = exist;

        let insertData = {
            fileId: file.id,
            monitoringId: id,
            caseId,
            description: ""
        }

        let fileByMonitoring = new filesofMonitoringsTable(insertData);
        
        let saveFile = await fileByMonitoring.save();


        if(saveFile) return true;
        else return false;

    }
    

    static async get(id, searchParams = false, req = false) {
        let where = {
            deleted: false
        };
        let limit = 50;
        let skip  = 0;
        let monsViews = [];
        if(id) {
            where._id = id
        } else if(searchParams) {
            // Solo usamos parametros de busqueda si no se especifico id

            let { disputar_response, userId, caseId, createdBy, evaluated, invalidated, disputado, program, dateCreatedAtStart, dateCreatedAtEnd, limit:limit_of_get, offset:offset_of_get, status } = searchParams;
            if(limit_of_get && limit_of_get < 200 && limit_of_get > 0 ) {
                limit = parseInt(limit_of_get)
            } 

            if(offset_of_get && offset_of_get > 0) {
                skip = parseInt(offset_of_get);
            }

            if(userId) { where.userId = userId; }
            if(caseId) { where.caseId = caseId; }

            if(program) { 
                program = program.split('%%');
                where.programId = { $in: program }; 
            }

            if(createdBy) { where.createdBy = createdBy; }

            if(dateCreatedAtStart) {
                dateCreatedAtStart = new Date(dateCreatedAtStart);
                if(dateCreatedAtStart instanceof Date) { 
                    where.createdAt = { $gte: dateCreatedAtStart }
                }
            }

            if(dateCreatedAtEnd) {
                dateCreatedAtEnd = new Date(dateCreatedAtEnd);
                if(dateCreatedAtEnd instanceof Date) { 
                    where.createdAt = where.createdAt ? { ...where.createdAt, $lte: dateCreatedAtEnd } : { $lte: dateCreatedAtEnd };
                }
            }
            if(status && existingStatus.includes(status)) { where.status = status; }
            if(disputado) { 
                where.disputar = disputado === 'false' ? false : { $ne: false }; 
            }
            if(disputar_response) {
                where.disputar_response = disputar_response === 'false' ? false : { $nin: ["", undefined] };
            }
            if(invalidated) {
                where.invalidated = invalidated === 'false' ? false : { $ne: false }; 
            }
            if(evaluated) {
                where.evaluated = evaluated === 'false' ? false : { $ne: false };
            }
        }
        /**
         * Esto permmitira que los usuarios vean los monitoreos asignados a los programas que tienen permitidos
         */
        if (req) {
            // comprobamos si es administrador
            let user = await includes.users.model.getUsersperGroup(req.authUser[0].id);
            const empresa = req.authUser[0].razonSocial;
            if (user.indexOf('all') >= 0 || req.authUser[0].role.role === 'ADMINISTRATOR') {
                monsViews = ['all'];
            } else if(empresa === "TELECOM") {
                monsViews = ["all"];
            } else {
                let programasPermitidos = await Program.get(req);
                for(let pp of programasPermitidos) {
                    if(!monsViews.includes(pp.id)) {
                        monsViews.push(pp.id)
                    }
                }
            }
        } else {
            monsViews = ["all"];
        }
        
        if(monsViews.length === 0) throw new Error('No existe ningun monitoreo');

        if(monsViews[0] !== 'all' && !where.programId) {
            where.programId = { $in: monsViews };
        } else if(monsViews[0] !== 'all'){
            const programasBuscados = where.programId.$in;
            const programasFiltrados = monsViews.filter( e => programasBuscados.includes(e.toString()))
            where.programId.$in=programasFiltrados;
        }
        

        let query = await monSchema.find(where).skip(skip).limit(limit).sort({ transactionDate: -1 });
        
        let monitoring_total_count = await monSchema.find(where).count();

        let returnData = []
        for(let mons of query) {
            let program = await Program.getProgramName(mons.programId);
            let td = {
                id: mons._id,
                monitoring_total_count,
                userId: mons.userId,
                invalidated: mons.invalidated,
                improvment: mons.improvment,
                duracionContacto: mons.duracionContacto,
                evaluated: mons.evaluated,
                status: mons.status,
                transactionDate: mons.transactionDate,
                caseId: mons.caseId,
                program,
                createdBy: mons.createdBy,
                disputado: mons.disputar,
                disputar_response: mons.disputar_response || "",
                monitoringDate: mons.monitoringDate,
                createdAt: mons.createdAt,
                modifiedBy: mons.modifiedBy,
                devolucionRepresentante: !!mons.comentariosDevolucion
            }
            if(id) {
                // td.customSections       = JSON.parse(mons.customSections);
                td.responses_object = mons.responses;
                td.comments = mons.comments;
                td.userInfo = await includes.users.model.get(mons.userId);
                td.userInfo = td.userInfo.length > 0 ? td.userInfo[0]: undefined;
                td.devolucion = {
                    comentariosDevolucion: mons.comentariosDevolucion,
                    fortalezasUsuario: mons.fortalezasUsuario,
                    pasosMejora: mons.pasosMejora
                }
                td.responses = Monitoring.getCustomSectionsWithResponses(JSON.parse(mons.customSections), mons.responses);
                
                td.files = await filesofMonitoringsTable.find({ monitoringId: mons._id });

            }

            returnData.push(td);
        }

        return returnData;
    }

    static getCustomSectionsWithResponses(customSections, responses) {

        for(let c = 0; c < customSections.length; c++) {

            for(let j = 0; j < customSections[c].customFields.length; j++) {
                let cField = customSections[c].customFields[j];
                let rsp = responses.find(e => e.section === customSections[c].id && e.question === cField.questionId);

                customSections[c].customFields[j] = {
                    ...cField,
                    responses: []
                }


                if(rsp) {
                    customSections[c].customFields[j].responses = rsp.responses;
                }
            }

        }
        return customSections;
    }

    static async deleteFile(id, _id) {
        if(!id || !_id) throw new Error('ID No especificado');

        let c = await filesofMonitoringsTable.find({ monitoringId: id, _id });
        if (c.length === 0) throw new Error('Registro inexistente');

        if(c[0].fileId){
            let deleteFile = new includes.files(c[0].fileId);
            deleteFile = await deleteFile.delete();
            if (!deleteFile) throw new Error('Error al eliminar el archivo')
        }
        c = await filesofMonitoringsTable.deleteOne({ _id });
        if (c.deletedCount === 0) {
            throw new Error('Error al eliminar el registro')
        }

        return true;

    }

    static async delete(id, deletedBy = false) {
        if(!id) throw new Error('Error en el id')

        let consulta = await monSchema.findById(id).where({ deleted: false });
        if(!consulta) throw new Error('Monitoreo inexistente');

        // Modificamos el delete logico de los monitoreos, por un delete total. aceptado por Gabriel Pellicen el 10/02/2021

        // if(consulta.responses.length > 0 || consulta.status !== 'pending') throw new Error('No se puede eliminar un monitoreo que ya se modificó');

        // let query = await monSchema.updateOne({ _id: id }, { deleted: true });
        // if(query.ok > 0) {
        //     this.addModificationByUser(id, deletedBy)
        //     return true;
        // }else return false;

        let query = await monSchema.deleteOne({ _id: id });
        if(query.ok > 0) return true;
        else return false;
    }

    /**
     * Esta funcion elimina un monitoreo si nunca fue contestado
     * @param {String} id 
     */
    static async delete_never_used(id) {
        if(!id) throw new Error('Error en el id')

        let consulta = await monSchema.findById(id);
        if(!consulta) throw new Error('Monitoreo inexistente');

        if(consulta.modifiedBy && consulta.modifiedBy.length > 0) throw new Error('No puede eliminar un formulario que ya fue editado, comuniquesé con su superior');
        
        consulta = await monSchema.deleteOne({ _id: id });
        if(consulta.ok == 1 && consulta.deletedCount == 1) return true;
        else return false;        
    }

    static async modify(id, data, modifiedBy = false) {
        if(!id) throw new Error('Error en el id')
        else if(!data) throw new Error('No se envio ningun parametro para modificar');

        let consulta = await monSchema.findById(id).where({ deleted: false });;
        if(!consulta) throw new Error('Monitoreo inexistente');

        /**
         * Un externo no puede modificar monitoreos cargados por telecom, lo unico que puede es disputar y la respuesta a disputar
         * 
         */
        let dataToModify = {};
        let authorizedColumnsToModify = [];

        if(!modifiedBy || !modifiedBy.userCompany) throw new Error('Error en "modifiedBy" models/monitorins.js');
        else if(modifiedBy.userCompany !== 'TELECOM'){
            // Buscamos el creador del monitoreo
            let { createdBy } = consulta;
            if(!createdBy) throw new Error('Usuario creador erroneo. Error interno');
            createdBy = await includes.users.schema.find({ id: createdBy });
            if(createdBy.length === 0) throw new Error('Usuario creador inexistente. Error interno');
            createdBy = createdBy[0].razonSocial;

            if(createdBy === 'TELECOM') {
                authorizedColumnsToModify = ["disputar", "disputar_response"];
            } else if(createdBy === modifiedBy.userCompany) {
                authorizedColumnsToModify = ["improvment", "duracionContacto", "userId", "transactionDate", "monitoringDate", "comentariosDevolucion", "fortalezasUsuario", "pasosMejora", "comments", "responses", "invalidated", "disputar", "disputar_response","status"];
            } else return false;
        } else {
            authorizedColumnsToModify = ["improvment", "duracionContacto", "userId", "transactionDate", "monitoringDate", "comentariosDevolucion", "fortalezasUsuario", "pasosMejora", "comments", "responses", "invalidated", "disputar", "disputar_response","status"];
        }

        for(let d in data) {
            if(!authorizedColumnsToModify.includes(d)) continue;
            if(data[d] && typeof data[d] == 'string'){
                dataToModify[d] = data[d];
            } else if(data[d] instanceof Array && data[d].length > 0) {
                dataToModify[d] = data[d]
            }
        }

        if(dataToModify.responses && dataToModify.responses.length > 0) {
            // Analizamos las respuestas segun el formulario
            let { responses } = this.checkResponsesWithQuestions(consulta.customSections, dataToModify.responses)
            
            dataToModify.responses = responses;
        }

        let query = await monSchema.updateOne({ _id: id }, dataToModify);
        if(query.ok > 0) {
            this.addModificationByUser(id, modifiedBy, dataToModify);
            return true;
        }else return false;
    }

    static checkResponsesWithQuestions(customSections, responses) {
        if(!customSections || !responses) throw new Error('Error en los parametros enviados al querer modificar las respuestas');

        let returnData = {
            responses: []
        }
        customSections = JSON.parse(customSections);

        /** Esta funcion retorna los valores para incluir a los arrays
         */
        const checkResponse = (cfield, responses_of_question) => {
            let responseData = {
                parametrizableValue: false,
                calibrable: cfield.calibrable
            }
            for(let response of responses_of_question ) {
                // ATENCIOOOON! SOLO VAMOS A PONER COMO PARAMETRIZABLE EL VALOR DEL PADRE
                if(response.value) { 
                    let v = cfield.values.find(e => e.value == response.value);
                    if(!v) continue;
                    responseData.parametrizableValue = v.parametrizableValue || false;
                }
                // if((response.responses && response.responses.length === 0) || response.responses === undefined) {
                //     // Es porque responde directamente sin importarle los childs
    
                //     // Solo cambiamos el valor de calibrable si es falso, si es true queda asi
                //     /**
                //      * Comentamos los valores de calibrables para los hijos, ya que solamente me insteresa saber si es calibrable el padre 
                //      */
                //     // responseData.calibrable = cfield.calibrable;
                    
                //     if(response.value) { 
                //         let v = cfield.values.find(e => e.value == response.value);
                //         if(!v) return false;
                //         responseData.parametrizableValue = v.parametrizableValue || false;
                //     }
                // } else {
                //     for(let v of cfield.values) {
                //         if(v.value === response.data) {
                //             if(!v.customFieldsSync) {
                //                 // responseData.calibrable = cfield.calibrable;
                //                 responseData.parametrizableValue = v.parametrizableValue;
                //                 return responseData;
                //             }
                //             let customFieldSync = v.customFieldsSync[0];
                //             if(customFieldSync.type !== 'text' || customFieldsSync.type !== 'area') {
                //                 // Solo revisamos los valores si no es text o text area
                //                 return checkResponse(customFieldSync, response.child);
                //             } 
                //         }
                //     }
                // }
            }

            return responseData

        }

        for(let r of responses) {
            // Analizamos cada response, haber si existe la respuesta
            let questionToPush = {
                section: r.section,
                question: r.question,
                responses: r.responses,
                parametrizableValue: false,
                calibrate: false
            }
            // Checkeamos si existe la seccion
            let section = customSections.find(element => element.id == r.section);
            if(!section) continue; // Es porque no existe la seccion

            let question = section.customFields.find(e => e.questionId == r.question);
            if(!question) continue; // es porque no existe la pregunta0

            // Consultamos el tipo de pregunta
            const { type } = question;
            if(type !== 'text' && type !== 'area') {
                // Agregamos la pregunta directamente, ya que no es calibrable ni monitoreable
                let d = checkResponse(question, r.responses);
                if(!d) continue;

                let { calibrable, parametrizableValue } = d;
                questionToPush.calibrate            = calibrable;
                questionToPush.parametrizableValue  = parametrizableValue;

            }
            returnData.responses.push(questionToPush);

        }

        return returnData;
  

    }

    static async addModificationByUser(id, modifiedData, action){
        if(!id || !modifiedData) return false;

        try {
            let userData = this.generateModificateObject(modifiedData);
            // Agregamos todos los campos que se modificaron
            userData.actions = [];
            for(let m in action) {
                userData.actions.push(m);
            }

            let consulta = await monSchema.findById(id);
            if(!consulta) return false;
    
            let modifiedBy = [...consulta.modifiedBy, userData];
    
            let guardarModificacion = await monSchema.updateOne({ _id: id }, {modifiedBy});
            if(guardarModificacion.ok > 0) return true;
            else return false;

        } catch (e) {
            console.log(e);
            return false;
        }
    }

    static generateModificateObject({ userId, userRole, userData }) {
        if(!userId || !userRole) return false;

        const { name, lastName, legajo } = userData

        return {
            userId,
            name,
            lastName,
            legajo,
            rol: userRole
        }
    }

    static async export(monitoringIds) {
        if(!monitoringIds) throw new Error('Error en los parametros enviados');
        // if(monitoringIds.length > 30) throw new Error('No puede exportar mas de 30 monitoreos en la misma plantilla');

        const getValuesByCustomField = (cfield, responses) => {
            if(cfield.values && cfield.type !== 'text' && cfield.type !== 'area') {
                let td = [];
                for(const rsp of responses) {
                    let response;
                    if(rsp.value){
                        response = cfield.values.find(e => e.value == rsp.value);
                    } else {
                        response = {};
                        response.value = rsp.value || "";
                    }
                    if(!response) return false;

                    // Buscamos si ya existe la columna
                    let indexExists = td.findIndex(element => element.id == cfield.id);
                    
                    const parent_value = rsp.parent_id == rsp.parent_value ? "" : `${rsp.parent_value} --> `;

                    const value = `${parent_value}${rsp.value}`;
                    if(indexExists === -1) {
                        const temp_td = {
                            id: rsp.id,
                            name: cfield.name,
                            value: value,
                            parametrizableValue: response.parametrizableValue
                        }
                        td.push(temp_td);
                    } else {
                       td[indexExists].value += ` | ${value}` 
                    }
                    
                    if(rsp.responses && rsp.responses.length > 0) {
                        let more = getValuesByCustomField(response.customFieldsSync[0], rsp.responses)
                        td = td.concat(more);
                    }
                }
                return td;
            } else if(cfield.type === 'text' || cfield.type === 'area') {
                if(responses && responses[0]) {
                    return [{
                        id: responses[0].id || "",
                        name: cfield.name,
                        value: responses[0].value || "",
                        parametrizableValue: false
                    }]
                }
            } else return false;
        }

        const get_last_modification = (modifiedByArray, columnName) => {

            /**
             * Hardcodeo el nombre de disputado por disputar ya que, una modificacion de nombres llevaria a multiples modificaciones de front y back-
             * 
             */
            if(columnName === 'disputado'){
                columnName = "disputar";
            }

            let addRow = {
                label: "<-- Ult. Modificación " + columnName,
                value: "Never"
            };
            modifiedByArray = modifiedByArray && modifiedByArray.length > 0 ? modifiedByArray.sort((a,b) => b.modifiedAt - a.modifiedAt) : [];

            for(let m of modifiedByArray) {
                if(m.actions.includes(columnName)){
                    let d = new Date(m.modifiedAt);
                    
                    addRow.value = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

                    const user_identification = m.name && m.lastName ? `${m.name} ${m.lastName}` : m.legajo ? m.legajo : m.userId;

                    addRow.value += ` | By: ${user_identification}`;
                    break;
                }
            }

            return addRow;
        }

        /**
         * Esta funcion agrega cada columna a un array de headers y cada registro
         * @param {Object} data 
         */
        const addHeadersAndRows = (data) => {
            this.rows.push(data)
            for(let d in data) {
                if(!this.headers.includes(d)) {
                    this.headers.push(d);
                }
            }
        }

        this.rows       = [];
        this.headers    = [];

        for(let id of monitoringIds) {
            let mon = await Monitoring.get(id);
            if(mon.length === 0) continue;

            let user = await includes.users.model.get(mon[0].userId);
            if(user.length === 0) continue;
            let data = {}

            const viewRows = {
                user: ["dni", "name", "lastName", "cuil", "legajo", "sexo", "status", "propiedad", "canal", "negocio", "edificioLaboral", "gerencia1", "nameG1", "gerencia2", "nameG2", "equipoEspecifico", "group", "role", "razonSocial", "jefeCoordinador", "responsable", "supervisor", "lider", "provincia", "region", "subregion", "email"],
                mon: ["comentariosDevolucion","disputar_response" ,"invalidated", "evaluated", "status", "transactionDate", "monitoringDate", "caseId", "program", "createdBy", "disputado", "createdAt", "comentariosMejora", "modifiedBy", "responses"]
            }
            // Recorremos el objeto y modificamos
            let string;
            user = user[0]

            for(let f in user) {
                if(!viewRows.user.includes(f)) continue;
                switch(f) {
                    case "group": 
                        string = "";
                        user[f].map(v => {
                            string = string ? string + ' - ' : "";
                            string += `${v.name}`;
                        })
                        user[f] = string;
                    break;
                    case "role": 
                        user[f] = user[f].role;
                    break;
                }

                user[f] = user[f] ? user[f].toString() : "";

                data[`user - ${f}`] = {value: user[f], style: ""};
            }

            
            // Arranca a preparar la informacion del monitoreo
            mon = mon[0];

            /**
             * Hardcodeamos los nombres de devolucion porque vienen dentro de un objeto.
             */
            const { fortalezasUsuario, pasosMejora, comentariosDevolucion } = mon.devolucion;
            mon.fortalezasUsuario       = fortalezasUsuario     || "";
            mon.pasosMejora             = pasosMejora           || "";
            mon.comentariosDevolucion   = comentariosDevolucion || "";
            const Array_Modificaciones  = mon.modifiedBy;
            for(let c in mon) {

                let addRow = false;
                if(!viewRows.mon.includes(c)) continue;
                let columnName = c;

                switch(c) {
                    case 'modifiedBy': 
                        string = "";
                        mon[c].map(v => {
                            string = string ? string + '  |  ' : "";
                            let date = new Date(v.modifiedAt);
                            const user_identification = v.name && v.lastName ? `${v.name} ${v.lastName}` : v.legajo ? v.legajo : v.userId;

                            string += `${user_identification} - ${v.rol} - ${date.getDate()}/${date.getMonth()  + 1}/${date.getFullYear()}`;
                        })
                        mon[c] = string;
                    break;
                    case "responses": 
                    
                        for(let resp of mon[c]) {
                            let sect = resp.name;
                            for(let cfield of resp.customFields) {
                                let question = cfield.question;

                                // Vamos a agregar una columna por respuesta
                                let q = getValuesByCustomField(cfield, cfield.responses);
                                console.log(q);
                                if(q && q.length > 0) {
                                    q.forEach((v, i) => {
                                        data[`S: ${sect}[Q: ${question}]--> R: ${i + 1}. ${v.name}`] = {value: v.value, style: ""};
                                        if(v.parametrizableValue !== false) {
                                            data[`S: ${sect}[Q: ${question}]--> R: ${i + 1}. ${v.name} | value`] = v.parametrizableValue;
                                        }
                                    })
                                }

                            }

                        }
                        
                        continue;
                    break;
                    case 'disputado':
                        // Obtenemos la fecha de modificacion de esta columna
                        addRow = get_last_modification(Array_Modificaciones, c);
                        columnName = "Observaciones del monitoreo";
                        break;
                    case 'disputar_response':
                        addRow = get_last_modification(Array_Modificaciones, c);
                        columnName = "Rta. Observaciones del monitoreo";
                    break;
                    case "comentariosDevolucion":
                        addRow = get_last_modification(Array_Modificaciones, c);
                        columnName = "Devolucion al representante";
                        break;
                }

                if(mon[c] instanceof Date) {
                    let d = new Date(mon[c]);
                    mon[c] = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
                } else {
                    mon[c] = mon[c] ? mon[c].toString() : "";
                }
                data[`monitoring - ${columnName}`] = {value: mon[c], style: ""};
            
                /**
                 * Si es true, agregamos una columna mas siuendo
                 */
                if(addRow) {
                    data[`monitoring - ${addRow.label}`] = {value: addRow.value, style: ""};
                }
                
            }
            addHeadersAndRows(data);
        }

        let today = new Date();
        today = `${today.getDate()}-${today.getMonth()  + 1}-${today.getFullYear()}`;
        let monExp = new includes.XLSX.XLSXFile('monitoring Export ' + today + '.xlsx', 'monExports');

        let mons = new includes.XLSX.Sheet(monExp, 'monitorings');

        mons.addHeaders(this.headers);

        for(let d of this.rows){
            mons.addRow(d)
        }

        mons.createSheet();
        let save = await monExp.save();
        if(!save) throw new Error("Error al crear el archivo");

        return save;
    }
}

module.exports = Monitoring;