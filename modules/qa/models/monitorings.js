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
const { response } = require('express');

const existingStatus = ['pending', 'run', 'finished'];

class Monitoring {
    constructor(data) {
        const { userId, transactionDate, caseId, programId, createdBy } = data;
    
        this.userId             = userId            || false;
        this.transactionDate    = transactionDate   || false;
        this.caseId             = caseId            || false;
        this.programId          = programId         || false;
        this.createdBy          = createdBy         || false;
        this.customSections     = "";
    }

    async save() {

        const requiredValues = ["userId", "transactionDate", "caseId", "programId", "createdBy"];
        for(let t in this) {
            if(requiredValues.includes(t) && !this[t]) throw new Error('Error en los parametros enviados');
        }

        // Buscamos el formulario asignado a el programa
        let customSections = await formsModel.getFormByProgram(this.programId);
        if(!customSections) throw new Error('Formulario inexistente, error interno de api');
        this.customSections = await Monitoring.getFormWithStr(customSections.parts);
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
        let returnData = [];
        // Buscamos cada custom section
        for(let section of customSections) {
            let td = {
                name: section.name,
                id: section._id,
                customFields: [] 
            }

            for(let cf of section.customFields) {
                let question = {
                    question: cf.question,
                    id: cf._id,
                    customField: ""
                }

                let customField = await customFieldModel.get(cf.customField);
                if(customField.length === 0) continue;

                question.customField = customField[0]

                td.customFields.push(question);
            }

            returnData.push(td);
        }

        return JSON.stringify(returnData);
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
        let monsViews = [];

        if(id) {
            where._id = id
        } else if(searchParams) {
            // Solo usamos parametros de busqueda si no se especifico id
            let { userId, caseId, createdBy, evaluated, invalidated, disputado, program, dateTransactionStart, dateTransactionEnd, responses, status } = searchParams;

            if(userId) { where.userId = userId; }

            if(caseId) { where.caseId = caseId; }

            if(program) { where.programId = program; }

            if(createdBy) { where.createdBy = createdBy; }

            if(dateTransactionStart = new Date(dateTransactionStart) && dateTransactionStart instanceof Date) { where.transactionDate = { $gte: dateTransactionStart }}

            if(dateTransactionEnd = new Date(dateTransactionEnd) && dateTransactionEnd instanceof Date) { where.transactionDate = { $lte: dateTransactionEnd }}
        
            if(status && existingStatus.includes(status)) { where.status = status; }

            if(disputado) { 
                where.disputar = disputado === 'false' ? false : { $ne: false }; 
            }

            if(invalidated) {
                where.invalidated = invalidated === 'false' ? false : { $ne: false }; 
            }

            if(evaluated) {
                where.evaluated = evaluated === 'false' ? false : { $ne: false };
            }
        }


        if (req) {
            // comprobamos si es administrador
            let user = await includes.users.model.getUsersperGroup(req.authUser[0].id);
            if (user.indexOf('all') >= 0 || req.authUser[0].role.role === 'ADMINISTRATOR') {
                monsViews = ['all'];
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
        if(!monsViews[0] === 'all') {
            where.programId = { $in: monsViews };
        }

        let query = await monSchema.find().where(where).limit(300);
        let returnData = []
        for(let mons of query) {
            let program = await Program.getProgramName(mons.programId);
            let td = {
                id: mons._id,
                userId: mons.userId,
                invalidated: mons.invalidated,
                evaluated: mons.evaluated,
                status: mons.status,
                transactionDate: mons.transactionDate,
                caseId: mons.caseId,
                program,
                createdBy: mons.createdBy,
                disputado: mons.disputar,
                dates: {
                    monitoringDate: mons.monitoringDate,
                    createdAt: mons.createdAt
                },
                devolucion: mons.devolucion,
                modifiedBy: mons.modifiedBy
            }
            if(id) {
                td.customSections       = JSON.parse(mons.customSections);
                td.responses            = mons.responses;
                td.monitoringsFields    = mons.monitoringsFields;
                td.calibrationsFields   = mons.calibrationsFields;
                
                td.files = await filesofMonitoringsTable.find({ monitoringId: mons._id });

            }

            returnData.push(td);
        }

        return returnData;
    }

    static async deleteFile(id, fileId) {
        if(!id || !fileId) throw new Error('ID No especificado');


    }

    static async modify(id, data, modifiedBy = false) {
        if(!id) throw new Error('Error en el id')
        else if(!data) throw new Error('No se envio ningun parametro para modificar');

        let dataToModify = {};
        const authorizedColumnsToModify = ["userId", "transactionDate", "monitoringDate", "devolucion", "comments", "responses", "invalidated", "disputar","status"];
        for(let d in data) {
            if(!authorizedColumnsToModify.includes(d)) continue;
            if(data[d] && typeof data[d] == 'string'){
                dataToModify[d] = data[d];
            } else if(data[d] instanceof Array && data[d].length > 0) {
                dataToModify[d] = data[d]
            }
        }

        let consulta = await monSchema.findById(id);
        if(!consulta) throw new Error('Monitoreo inexistente');

        if(dataToModify.responses && dataToModify.responses.length > 0) {

            // Analizamos las respuestas segun el formulario
            let { responses } = this.checkResponsesWithQuestions(consulta.customSections, dataToModify.responses)
            
            dataToModify.responses = responses;
        }

        let query = await monSchema.updateOne({ _id: id }, dataToModify);
        if(query.ok > 0) {
            this.addModificationByUser(id, modifiedBy)
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
        const checkResponse = (cfield, response) => {
            let responseData = {
                parametrizableValue: false,
                calibrable: false
            }
            if(response.child === undefined) {
                // Es porque responde directamente sin importarle los childs
                responseData.calibrable = cfield.calibrable;

                let v = cfield.values.find(e => e.value == response.data);
                if(!v) return false;
                responseData.parametrizableValue = v.parametrizableValue;
                return responseData
            } else {
                for(let v of cfield.values) {
                    if(v.value === response.data) {
                        if(!v.customFieldsSync) {
                            responseData.calibrable = cfield.calibrable;
                            responseData.parametrizableValue = v.parametrizableValue;
                            return responseData;
                        }
                        let customFieldSync = v.customFieldsSync[0];
                        if(customFieldSync.type !== 'text' || customFieldsSync.type !== 'area') {
                            // Solo revisamos los valores si no es text o text area
                            return checkResponse(customFieldSync, response.child);
                        } else {
                            return responseData;
                        }
                    }
                }
            }
        }

        for(let r of responses) {
            // Analizamos cada response, haber si existe la respuesta
            let questionToPush = {
                section: r.section,
                question: r.question,
                response: r.response,
                parametrizableValue: false,
                calibrate: false
            }
            // Checkeamos si existe la seccion
            let section = customSections.find(element => element.id == r.section);
            if(!section) continue; // Es porque no existe la seccion

            let question = section.customFields.find(e => e.id == r.question);
            if(!question) continue; // es porque no existe la pregunta0

            // Consultamos el tipo de pregunta
            const { type } = question.customField;
            if(type === 'text' || type === 'area') {
                // Agregamos la pregunta directamente, ya que no es calibrable ni monitoreable
                questionToPush.response = r.response.data;

            } else {
                let d = checkResponse(question.customField, r.response);
                if(!d) continue;

                let { calibrable, parametrizableValue } = d;
                questionToPush.calibrate            = calibrable;
                questionToPush.parametrizableValue  = parametrizableValue;

            }

            returnData.responses.push(questionToPush);

        }

        return returnData;
  

    }

    static async addModificationByUser(id, modifiedData){
        if(!id || !modifiedData) return false;

        try {
            let userData = this.generateModificateObject(modifiedData);
    
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

    static generateModificateObject({ userId, userRole }) {
        if(!userId || !userRole) return false;
        return {
            userId,
            rol: userRole
        }
    }

}

module.exports = Monitoring;