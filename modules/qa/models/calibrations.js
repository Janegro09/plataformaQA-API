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

const caltypeTable = require('../migrations/calibrationsTypes.table');
const calibrationsTable = require('../migrations/calibrations.table');
const monitoringTable = require('../migrations/monitorings.table');
const monitoringModel = require('./monitorings');

class Calibrations {
    constructor(data) {
        const { caseId, calibrationType, calibrators, expert } = data;
        this.caseId             = caseId            || false;
        this.calibrationType    = calibrationType   || false;
        this.calibrators        = calibrators       || [];
        this.expert             = expert            || false;
    }

    async save () {
        let { caseId, calibrationType, calibrators, expert } = this;
        if(!caseId || !calibrationType || !expert) throw new Error('Debe completar los parametros requeridos por la funcion');

        // Consultamos si existe una sesion de calibracion con ese case ID
        let existSession = await calibrationsTable.find({ caseId });
        if(existSession.length > 0) throw new Error('Ya existe una sesion de calibracion con el caseID especificado');

        // Comprpbamos si existe el tipo de calibracion
        let calibrationTypeExist = await caltypeTable.find({ name: calibrationType });
        if(calibrationTypeExist.length === 0) throw new Error('Tipo de calibracion inexistente, ingrese un tipo existente');

        // Comprobamos si existe el usuario experto
        let existExpert = await includes.users.schema.find({ id: expert });
        if(existExpert.length === 0) throw new Error('El experto ingresado no existe en nuestras bases de datos');

        let calibratorsToAdd = [];
        for(let calibrator of calibrators) {
            let e = await includes.users.schema.find({ id: calibrator });
            if(e.length === 0) continue;
            
            calibratorsToAdd.push(calibrator)
        }

        let newSession = new calibrationsTable({
            caseId,
            calibrationType,
            calibrators: calibratorsToAdd,
            expert
        })

        let c = await newSession.save();
        if(c) return true;
        else return false;
    }

    /**
     * Esta funcion devuelve las sesiones de calibracion, si no se especifica ID
     *  Entonces devuelve una lista de todas las sesiones. 
     * Si se especifica ID:
     *  Entonces devuelve toda la info de la calibracion, las metricas de comparacion entre todos los monitoreos de los usuarios asignados con el case Id y tambien la informacion de los usuarios (solo nombre y ID)
     * @param {String} id 
     */
    static get = async (id) => {
        let where = {};
        if(id) {
            where._id = id;
        }

        let calibrations = await calibrationsTable.find().where(where);
        let returnData = [];

        for(let c of calibrations) {

            let td = {
                id: c._id,
                calibrators: c.calibrators,
                status_open: c.status_open,
                caseId: c.caseId,
                calibrationType: c.calibrationType,
                expert: c.expert,
                createdAt: c.createdAt,
                startDate: c.startDate,
                endDate: c.endDate
            }

            if(id) {
                td.calibrators = await Calibrations.getCalibrators(c.calibrators);
                
                td.expert = await Calibrations.getCalibrators([c.expert]);
                td.expert = td.expert.length > 0 ? td.expert[0] : c.expert;

                td.calibration = await Calibrations.getCalibration(c.caseId, [...c.calibrators, c.expert]);
            }

            returnData.push(td);
        }

        return returnData;        
    }

    static async getCalibrators(calibratorsArray) {
        let calibrators = [];

        for(let c of calibratorsArray) {
            let user = await includes.users.model.get(c, true, false, true);
            if(user.length === 0) continue;

            user = user[0];
            calibrators.push(user);
        }

        return calibrators;

    }

    static async getCalibration(caseId, ArrayOfUsers){
        if(!caseId) throw new Error('Case id no especificado, error interno');
        if(ArrayOfUsers.length === 0) return false;
        let monitorings = [];
        let returnData = {
            error: false
        }
        for(let u of ArrayOfUsers) {
            // Buscamos si todos los usuarios tienen el monitoreo realizado
            let searchMonitoring = await monitoringTable.find({ caseId, createdBy: u, deleted: false });
            if(searchMonitoring.length === 0) {
                // Si existe algun usuario que no realizo el monitoreo entonces retornamos error ya que para hacer la comparacion necesitamos todos los monitoreos especificados
                returnData.error = "Esperando que los usuarios asignados realizen los monitoreos especificados";
                return returnData;
            } else {
                monitorings.push(searchMonitoring[0]);
            }
        }

        returnData.comparacion = await Calibrations.getMonitoringsComparation(monitorings);
        
        return returnData;
    }

    static async getMonitoringsComparation(monitorings) {

        let responsesGroups = [];

        const convertToString = (response) => {
            let str = response.data;
            if(response.child) {
                str += ' -> ' + convertToString(response.child);
            }
            return str;
        }

        for(let m of monitorings) {

            // Analizamos las respuestas y solo traemos las que sob calibrables
            let responses = m.responses;
            for(let e of responses) {
                if(e.calibrate) {
                    let td = {
                        response: e.response,
                        createdBy: m.createdBy
                    }
                    // Si existe el objeto de la respuesta la agregamnos sino lo creamos
                    let rsp = responsesGroups.findIndex(elem => elem.section === e.section && elem.question === e.question )
                    if(rsp !== -1) {
                        // Entonces lo agregamos al array de responses
                        responsesGroups[rsp].responses.push(td);
                    } else {
                        // Si no existe porque no se agrego ninguna respuesta, creamos el grupo
                        let group = {
                            section: e.section,
                            question: e.question,
                            responses: []
                        }

                        group.responses.push(td);
                        responsesGroups.push(group);
                    }
                }
            }
        }

        // Buscamos los nombres de las preguntas en uno de los forms
        let customSection = JSON.parse(monitorings[0].customSections);

        for(let rspGroup of responsesGroups){
            let section = customSection.find(elem => elem.id === rspGroup.section);

            if(section) {
                // Buscamos la pregunta
                let question = section.customFields.find(e => e.id === rspGroup.question);
                if(question) {

                    rspGroup.questionName = question.question;

                }
            }

        }
        
        // Analizamos las respuestas de cada pregunta y damos los resultados
        for(let rspGroup of responsesGroups) {
            let results = [];
            for(let rsp of rspGroup.responses) {
                // Lo paso a string y comparo entre strings
                let str = convertToString(rsp.response);
                
                let metrics = {
                    respuesta: str,
                    users: [rsp.createdBy],
                    cant: 1
                }

                // Consultamos si existe
                let existInResult = results.findIndex(e => e.respuesta === str);
                if(existInResult !== -1) {
                    results[existInResult].cant += 1;
                    results[existInResult].users = [...results[existInResult].users, rsp.createdBy];
                } else {
                    results.push(metrics);
                }
            }

            // Analizamos cantidad de respuestas iguales
            let cantOfResponses = rspGroup.responses.length;

            for(let i = 0; i < results.length; i++ ){

                results[i].resultado = (results[i].cant / cantOfResponses)
                results[i].porcentaje = `${((results[i].cant / cantOfResponses) * 100)}%`

            }
            
            rspGroup.result = results
        }

        return responsesGroups;
    }

    static async modify(id, data) {
        if(!id || !data) throw new Error("Error en los parametros enviados");

        // Comprobamos si existe la sesion de calibracion especificada y no esta cerrada
        let existSession = await calibrationsTable.findById(id);
        if(!existSession) throw new Error('Session inexistente');
        let columnsToModify = [];
        if(existSession.status_open) {
            // Si esta abierta podemos modificar muchas columna sino solo podemos modificar el estado
            columnsToModify = ["calibrators", "expert", "status_open", "calibrationType", "startDate", "endDate"];
        } else {
            columnsToModify = ["status_open"];
        }
        let dataToModify = {};
        for(let d in data) {
            if(!columnsToModify.includes(d)) continue;
            if(data[d] && typeof data[d] !== 'boolean'){
                dataToModify[d] = data[d]
            } else if(typeof data[d] === 'boolean') {
                dataToModify[d] = data[d]
            }
        }

        if(dataToModify.calibrationType) {
            let calibrationTypeExist = await caltypeTable.find({ name: dataToModify.calibrationType });
            if(calibrationTypeExist.length === 0) throw new Error('Tipo de calibracion inexistente, ingrese un tipo existente');
        }

        if(dataToModify.expert) {
            // Comprobamos si existe el usuario experto
            let existExpert = await includes.users.schema.find({ id: dataToModify.expert });
            if(existExpert.length === 0) throw new Error('El experto ingresado no existe en nuestras bases de datos');
        }

        if(dataToModify.calibrators) {
            let calibratorsToAdd = [];
            for(let calibrator of dataToModify.calibrators) {
                let e = await includes.users.schema.find({ id: calibrator });
                if(e.length === 0) continue;
                
                calibratorsToAdd.push(calibrator)
            }

            dataToModify.calibrators = calibratorsToAdd;
        }

        let c = await calibrationsTable.updateOne({_id: id}, dataToModify);
        if(c.ok > 0) return true;
        else return false;

    }

    static async delete(id) {
        if(!id) throw new Error('Id no especificado');

        // Buscamos si existe
        let exist = await calibrationsTable.findById(id);
        if(!exist) throw new Error('Calibracion inexistente');

        let del = await calibrationsTable.deleteOne({ _id: id });
        if(del.ok > 0) return true;
        else return false;
    }
}

module.exports = Calibrations;