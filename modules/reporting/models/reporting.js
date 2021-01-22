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

const sectionPermitted = ["analytics"]

const Schemas = {
    partitures: {
        partitures:     require('../../analytics/migrations/partitures.table'),
        infoByUsers:    require('../../analytics/migrations/partituresInfoByUsers.table'),
        instances:      require('../../analytics/migrations/instancesOfPartitures.table'),
        steps:          require('../../analytics/migrations/stepsOfInstances.table'),
        files:          require('../../analytics/migrations/filesByPartitures.table')
    }
}

const rows_order = {
    1: "G1",
    2: "G2",
    3: "coordinador",
    4: "responsable",
    5: "supervisor",
    6: "lider"

}


class Reporting {
    constructor(section, { partitureId, clusters, instances }, AuthUser) {
        this.section            = sectionPermitted.includes(section) ? section : false;
        this.id                 = partitureId   || false;
        this.partiture          = partitureId   || false;
        this.clusters           = clusters      || false;
        this.instances          = instances     || false;
        this.instancesDetail    = [];
        this.authUser           = AuthUser[0]   || false;
        this.users              = [];
        this.usersByPartitures  = [];
        this.usersIds           = [];
        this.viewPermissions    = { company: false, role: false };
        this.informes = [];
        this.informesJerarquicos = {};
        this.sheet = {
            data: [],
            headers: ["1","2","3","4","5","6","7"]
        }
    }

    async check_values() {
        const notEmptyValues = ["section", "partiture", "authUser", "id"];

        if(this.partiture) {
            let partiture = await Schemas.partitures.partitures.find({ _id: this.partiture });
            if(partiture.length === 0) throw new Error("Partitura inexistente");
            this.partiture = partiture[0] || false;
        } else throw new Error('Error en los parametros enviados');

        if(this.clusters) {
            let clusters = await Schemas.partitures.infoByUsers.find().where({ cluster: { $in: this.clusters } });
            for(let { userId } of clusters) {
                if(this.usersIds.includes(userId)) continue;
                this.usersIds.push(userId);
            }

            // Buscamos los usuarios
            let users = await includes.users.schema.find().where({ _id: { $in: this.usersIds } });

            users.map(v => this.users.push(Reporting.createUser(v)));

            this.usersByPartitures  = clusters;
        } else throw new Error('Error en los parametros enviados');

        if(this.instances) {
            let instances = await Schemas.partitures.instances.find().where({ _id: { $in: this.instances }, partitureId: this.id });
            this.instancesDetail = instances;
        } else throw new Error('Error en los parametros enviados');

        if(this.authUser) {
            const { role, razonSocial } = this.authUser;

            this.viewPermissions.company = razonSocial || false;
            this.viewPermissions.role    = role.role   || false;
        }


    }

    async create() {
        await this.check_values();

        await this.getInformes();
        // console.log(this.users, this.usersIds)

        await this.generar_rangos_jerarquicos();

        await this.create_data_to_excel();
        // console.log(this.informes)

        // Creamos el archivo xlsx
        let today = new Date();
        today = `${today.getDate()}-${today.getMonth()  + 1}-${today.getFullYear()}`;

        let report = new includes.XLSX.XLSXFile(`reporting ${today}.xlsx`, 'reporting');

        let reportSheet = new includes.XLSX.Sheet(report, "report");

        reportSheet.addHeaders(this.sheet.headers);

        for(let d of this.sheet.data) {
            reportSheet.addRow(d);
        }

        reportSheet.createSheet();

        let save = await report.save();
        if(!save) throw new Error("Error al crear el reporte");

        return save;

    }

    save_headers(headers) {
        if(typeof headers == 'object'){
            for(let index in headers) {
                if(!this.sheet.headers.includes(index)) {
                    this.sheet.headers.push(index);
                }
            }
        }
    }

    async getInformes() {
        // Iteramos sobre los usuarios y y guardamos la data y las metricas
        for(let user of this.users) {
            
            let partiture = this.usersByPartitures.find(e => e.userId == user.idDB);
            if(!partiture) continue;
            //Inicializar los valores solicitados: 
            //Detalle de transacción - step.detalleTransaccion
            //Oportunidades indentificadas - step.patronMejora
            //Resultados del representante de todas las instancias - step.resultadosRepresentante
            let informe = {
                ...user,
                monitoreos_requeridos: 0,
                monitoreos_audios: 0,
                monitoreos_messages: 0,
                monitoreos_totales: 0,
                monitoreos_faltantes: 0,
                messages: "",
                instancias: this.instances.length,
                pasos_in_date: 0,
                pasos_out_date: 0,
                pasos: 0,
                pasos_completados: 0,
                pasos_incompletos: 0,
                interviene_mando: 0,
                cumplimiento: 0,
                cluster: "",
                detallePA: "",
                GCAssigned: "",
                compromisoRepresentante: "",
                patronMejora: "",
                audioCoaching: 0,
                modificaciones: "",
                resultadosRepresentante: "",
                patronMejora: "",
                detalleTransaccion: "",
            }

            let improvments         = [];
            let messages            = [];
            let textosPorInstancias = [];

            // Obtenemos las instancias y los pasos
            let steps = await Schemas.partitures.steps.find({ userId: user.idDB, instanceId: { $in: this.instances }, partitureId: this.id });

            informe.pasos = steps.length;
            
            for(let step of steps) {
                informe.monitoreos_requeridos += step.requestedMonitorings;

                const this_instance = this.instancesDetail.find(e => e._id == step.instanceId);
                if(!this_instance) continue;

                let improvmentIndex = improvments.findIndex(e => e.instanceId == step.instanceId);
                if(improvmentIndex === -1) {
                    improvments.push({ instanceId: step.instanceId, instance: this_instance.name, improvment: step.improvment });
                } else {
                    improvments[improvmentIndex].improvment = step.improvment;
                }

                let indiceTextoPorInstancias = {
                    id:step._id,
                    patronMejora:"",
                    compromisoRepresentante:"",
                    detalleTransaccion:"",
                    resultadosRepresentante:""
                }

                //Agregamos pasos de mejora 20-11-2020
                if(step.patronMejora ) {
                    informe.patronMejora += informe.patronMejora !== "" ? ` | ${step.patronMejora}` : step.patronMejora;
                    indiceTextoPorInstancias.patronMejora = step.patronMejora;
                }

                if(step.compromisoRepresentante ){
                    informe.compromisoRepresentante += informe.compromisoRepresentante !== "" ? ` | ${step.compromisoRepresentante}` : step.compromisoRepresentante;
                    indiceTextoPorInstancias.compromisoRepresentante = step.compromisoRepresentante;
                }

                //Agregamos pasos de mejora 19-01-2021
                if(step.detalleTransaccion ){
                    informe.detalleTransaccion += informe.detalleTransaccion !== "" ? ` | ${step.detalleTransaccion}` : step.detalleTransaccion;
                    indiceTextoPorInstancias.detalleTransaccion = step.detalleTransaccion;
                }
                if(step.resultadosRepresentante ){
                    informe.resultadosRepresentante += informe.resultadosRepresentante !== "" ? ` | ${step.resultadosRepresentante}` : step.resultadosRepresentante;
                    indiceTextoPorInstancias.resultadosRepresentante = step.resultadosRepresentante;
                }

                textosPorInstancias.push(indiceTextoPorInstancias);

                // Informamos si el paso se completo
                if(step.completed) {
                    informe.pasos_completados += 1;
                } else {
                    informe.pasos_incompletos += 1;
                }

                // Buscamos los archivos para este step
                let files = await Schemas.partitures.files.find({ partitureId: this.id, userId: user.idDB, stepId: step._id });
                
                for (let f of files) {
                    if(f.section == "monitorings"){
                        if(f.fileId){
                            informe.monitoreos_audios += 1;
                        } else if(f.message) {
                            informe.monitoreos_messages += 1;
                            informe.messages = informe.messages !== "" ? ` | ${f.message}` : f.message;
                            messages.push(f.message);
                        }
                    }else{
                        informe.audioCoaching += 1;
                    }
                }

                if(step.responsibleComments || step.managerComments || step.coordinatorOnSiteComments || step.coordinatorComments || step.coordinatorOCComments || step.accountAdministratorComments) {
                    informe.interviene_mando += 1;
                }   

                if(this_instance.expirationDate && step.last_modification > this_instance.expirationDate) {
                    informe.pasos_out_date += 1;
                } else {
                    informe.pasos_in_date += 1;
                }

                
            }
            // Sacamos los totales
            informe.monitoreos_totales = informe.monitoreos_audios + informe.monitoreos_messages;
            informe.monitoreos_faltantes = informe.monitoreos_requeridos - informe.monitoreos_totales;

            informe.cumplimiento = parseFloat(informe.pasos_completados / informe.pasos);

            let partitureByUser = await Schemas.partitures.infoByUsers.find({ userId: user.idDB, partitureId: this.id });

            if(partitureByUser.length > 0) {
                informe.cluster     = partitureByUser[0].cluster       || undefined;
                informe.detallePA   = partitureByUser[0].detallePA     || undefined;
                informe.GCAssigned  = partitureByUser[0].GCAssigned    || undefined;
                let savedSection = [];
                for(let modification of partitureByUser[0].modifications){
                    if(savedSection.includes(modification.section)) continue;
                    let d = new Date(parseInt(modification.date));
                    let dataString = `${d.getUTCDate()}/${d.getUTCMonth()}/${d.getUTCFullYear()}`;
                    let mensaje = `${modification.id} / ${modification.section} / ${dataString}`;
                    informe.modificaciones += informe.modificaciones ? " | " + mensaje : mensaje;
                    savedSection.push(modification.section)
                }
            }

            // Agregamos los improvments
            for(let { instance, improvment } of improvments) {
                if(improvment === '+') {
                    improvment = "Mejora";
                } else if(improvment === '+-') {
                    improvment = "Mantiene";
                } else if(improvment === '-') {
                    improvment = "Empeora";
                }
                informe[`improvment [I:${instance}]`] = improvment;
            }

            let contador=1;
            for(let {patronMejora,
                     compromisoRepresentante, 
                     detalleTransaccion ,
                     resultadosRepresentante} of textosPorInstancias){
                        informe[`Oportunidades identificadas [S:${contador}]`] = patronMejora;
                        informe[`Compromiso del representante [I:${contador}]`] = compromisoRepresentante;
                        informe[`Detalle de transacción [I:${contador}]`] = detalleTransaccion;
                        informe[`Resultados del representante de todas las instancias [I:${contador}]`] = resultadosRepresentante;
            }

            for(let i = 0; i < messages.length; i++) {
                informe[`Message N°: ${i+1}`] = messages[i]; 
            }
            this.save_headers(informe);
            this.informes.push(informe)
        }
    }

    async check_permisions(permission) {
        const { company, role } = this.viewPermissions;

        const allPermitedRoles = ["ADMINISTRATOR","SUPERVISOR", "COORDINADOR"];

        if(company !== 'telecom' && role && !allPermitedRoles.includes(role)) {

            if(permission !== 'G1' && permission !== 'G2') {
                switch(role) {
                    case "GERENTE":
                        if(permission == 'responsable' || permission == "supervisor" || permission == 'lider') return true;
                        else return false;
                    case "RESPONSABLE":
                        if(permission == "supervisor" || permission == 'lider') return true;
                        else return false;
                    case "LIDER":
                        if(permission == 'lider') return true;
                        else return false;
                    case "LIDER ON SITE":
                        if(permission == 'lider') return true;
                        else return false;
                    default:
                    return false;
                }
            } else return false;

        } else if(company == 'telecom' && allPermitedRoles.includes(role)) return true; 
        else return false;
    }

    async create_data_to_excel() {
        // Comenzamos a armar el archivo de excel

        const search_childs = (section, name_parent) => {
            if(section !== 'representante') {
                for(let index in rows_order){
                    if(section !== rows_order[index]) continue;
                    for(let r2 of this.informesJerarquicos[rows_order[index]]) {
                        if(r2[rows_order[parseInt(index) - 1]] !== name_parent) continue;
                            let row2 = {
                                "1": "-",
                                "2": "-",
                                "3": "-",
                                "4": "-",
                                "5": "-",
                                "6": "-",
                                "7": "-",
                            }

                            if(this.check_permisions(rows_order[index])) {
                                row2 = {
                                    ...row2,
                                    ...r2
                                }
                            } else{
                                row2.name = r2.name
                            }
        
                            row2[index] = rows_order[index].toUpperCase();
                            this.sheet.data.push(row2);

                            if(section === "lider") {
                                for(let r3 of this.informes) {
                                    if(r3.lider !== row2.name) continue;
                                    let row3 = {
                                        "1": "-",
                                        "2": "-",
                                        "3": "-",
                                        "4": "-",
                                        "5": "-",
                                        "6": "-",
                                        "7": "REPRESENTANTE",
                                        ...r3
                                    }
                                    this.sheet.data.push(row3);
                                }
                            } else {
                                search_childs(rows_order[parseInt(index) + 1], row2.name)
                            }


                    }

                }
            }
        }

        for(let r of this.informesJerarquicos['G1']){
            let row = {
                "1": "G1",
                "2": "-",
                "3": "-",
                "4": "-",
                "5": "-",
                "6": "-",
                "7": "-",
            }

            if(this.check_permisions('G1')) {
                row = {
                    ...row,
                    ...r
                }
            } else {
                row.name = r.name;
            }

            this.sheet.data.push(row);

            search_childs('G2', r.name);
        }
    }   

    async generar_rangos_jerarquicos() {
        // Generamos informes de lider
        for(let representante of this.informes) {
            await this.addOrModifyInforme(representante, 'lider');
            await this.calculate_cumplimiento('lider');
        }
        // Generamos informes de supervisor
        const sections = ["lider","supervisor", "responsable","coordinador","G2","G1"];
        for(let j = 0; j < sections.length; j++) {
            let from        = sections[j];
            const create    = sections[j + 1];
            if(!create) break;

            for(let i of this.informesJerarquicos[from]) {
                await this.addOrModifyInforme(i, create);
                await this.calculate_cumplimiento(create);
            }

        }

    }

    async calculate_cumplimiento(row_name) {
        if(!row_name) return false;

        // Buscamos si existe el array
        if(!this.informesJerarquicos[row_name]) return false;

        for(let i = 0; i < this.informesJerarquicos[row_name].length; i++) {
            let cumplimiento = parseFloat(this.informesJerarquicos[row_name][i].pasos_completados / this.informesJerarquicos[row_name][i].pasos);

            this.informesJerarquicos[row_name][i].cumplimiento = cumplimiento;
        }
    }
    /**
     * 
     * @param {String} name Nombre del lider, supervisor, etc
     * @param {Object} data data del informe a inyectar
     * @param {String} row_name nombre del rango a generar
     */

    async addOrModifyInforme(data, row_name) {
        if(!row_name || !data)  return false;

        let name = data[row_name];
        if(!name)   { name = "Sin definir"; }
        // Buscamos si ya tiene un informe creado
        let informeIndex = -1;
        if( this.informesJerarquicos[row_name]){
            informeIndex = this.informesJerarquicos[row_name].findIndex(elem => elem.name === name);
        } else {
            this.informesJerarquicos[row_name] = [];
        }

        if(informeIndex === -1) {
            // Significa que no tiene un informe creado
            let informe = {
                name: name,
                monitoreos_requeridos: data.monitoreos_requeridos,
                monitoreos_audios: data.monitoreos_audios,
                monitoreos_messages: data.monitoreos_messages,
                monitoreos_totales: data.monitoreos_totales,
                monitoreos_faltantes: data.monitoreos_faltantes,
                instancias: data.instancias,
                pasos_in_date: data.pasos_in_date,
                pasos_out_date: data.pasos_out_date,
                pasos: data.pasos,
                pasos_completados: data.pasos_completados,
                pasos_incompletos: data.pasos_incompletos,
                interviene_mando: data.interviene_mando,
            }

            const { supervisor, responsable, coordinador, G2, G1 } = data;
            switch(row_name) {
                case "lider":
                    informe.supervisor  = supervisor    || 'Sin definir';
                    informe.responsable = responsable   || 'Sin definir';
                    informe.coordinador = coordinador   || 'Sin definir';
                    informe.G2          = G2            || 'Sin definir';
                    informe.G1          = G1            || 'Sin definir';
                    break;
                case "lider on site":
                    informe.supervisor  = supervisor    || 'Sin definir';
                    informe.responsable = responsable   || 'Sin definir';
                    informe.coordinador = coordinador   || 'Sin definir';
                    informe.G2          = G2            || 'Sin definir';
                    informe.G1          = G1            || 'Sin definir';
                    break;
                case "supervisor":
                    informe.responsable = responsable   || 'Sin definir';
                    informe.coordinador = coordinador   || 'Sin definir';
                    informe.G2          = G2            || 'Sin definir';
                    informe.G1          = G1            || 'Sin definir';
                    break;
                case "responsable":
                    informe.coordinador = coordinador   || 'Sin definir';
                    informe.G2          = G2            || 'Sin definir';
                    informe.G1          = G1            || 'Sin definir';
                    break;
                case "coordinador":
                    informe.G2          = G2            || 'Sin definir';
                    informe.G1          = G1            || 'Sin definir';
                    break;
                case "G2":
                    informe.G1          = G1            || 'Sin definir';
                    break;
            }

            this.informesJerarquicos[row_name].push(informe);
        } else {
            // Significa que tiene un informe creado

            this.informesJerarquicos[row_name][informeIndex].monitoreos_requeridos  += data.monitoreos_requeridos;
            this.informesJerarquicos[row_name][informeIndex].monitoreos_audios      += data.monitoreos_audios;
            this.informesJerarquicos[row_name][informeIndex].monitoreos_messages    += data.monitoreos_messages;
            this.informesJerarquicos[row_name][informeIndex].monitoreos_totales     += data.monitoreos_totales;
            this.informesJerarquicos[row_name][informeIndex].monitoreos_faltantes   += data.monitoreos_faltantes;
            this.informesJerarquicos[row_name][informeIndex].instancias             += data.instancias;
            this.informesJerarquicos[row_name][informeIndex].pasos_in_date          += data.pasos_in_date;
            this.informesJerarquicos[row_name][informeIndex].pasos_out_date         += data.pasos_out_date;
            this.informesJerarquicos[row_name][informeIndex].pasos                  += data.pasos;
            this.informesJerarquicos[row_name][informeIndex].pasos_completados      += data.pasos_completados;
            this.informesJerarquicos[row_name][informeIndex].pasos_incompletos      += data.pasos_incompletos;
            this.informesJerarquicos[row_name][informeIndex].interviene_mando       += data.interviene_mando;
        }

    }

    static createUser(user_data) {
        const { 
            id: user_id, 
            _id:idDB, 
            name, 
            lastName, 
            razonSocial:company, 
            email,
            legajo,
            status,
            propiedad,
            canal,
            nameG1: G1,
            nameG2: G2,
            jefeCoordinador: coordinador,
            responsable,
            supervisor,
            lider
        } = user_data;

        return { user_id, idDB, name, lastName, company, email, legajo, status, propiedad, canal, G1, G2, coordinador, responsable, supervisor, lider
        }
    }
}

module.exports = Reporting;