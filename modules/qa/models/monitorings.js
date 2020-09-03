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
        this.customSections = JSON.stringify(customSections.parts);

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

    async saveFile (id, req = false) {
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
            let { userId, caseId, createdBy, program, dateTransactionStart, dateTransactionEnd, responses, status } = searchParams;

            if(userId) { where.userId = userId; }

            if(caseId) { where.caseId = caseId; }

            if(program) { where.programId = program; }

            if(createdBy) { where.createdBy = createdBy; }

            if(dateTransactionStart = new Date(dateTransactionStart) && dateTransactionStart instanceof Date) { where.transactionDate = { $gte: dateTransactionStart }}

            if(dateTransactionEnd = new Date(dateTransactionEnd) && dateTransactionEnd instanceof Date) { where.transactionDate = { $lte: dateTransactionEnd }}
        
            if(status && existingStatus.includes(status)) { where.status = status; }
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

        let query = await monSchema.find().where(where);
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
                createdAt: mons.createdAt
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

    static async modify(id, data) {
        if(!id) throw new Error('Error en el id')
        else if(!data) throw new Error('No se envio ningun parametro para modificar');


    }

}

module.exports = Monitoring;