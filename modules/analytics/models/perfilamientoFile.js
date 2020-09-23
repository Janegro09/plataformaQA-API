/**
 * @fileoverview Modulo analytics
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

const programsModel = require('../../programs/models/programs');

const PerfilamientoFile = {
    /**
     * Funcion para dividir la base consolidada en varios registros
     */
    baseConsolidada: [],
    programtoAssign: false,
    filesToCreate: [],
    filesIds: [],
    async dividirBaseConsolidada(files, program) {
        this.init()
        // Dividimos el array en varias bases
        this.baseConsolidada = files;
        this.programtoAssign = program;
        this.dividirBase();

        for(let x = 0; x < this.filesToCreate.length; x++){
            this.createFile(this.filesToCreate[x]);
        }

        return this.filesIds.length;
    },
    init() {
        this.baseConsolidada = [];
        this.programtoAssign = false;
        this.filesToCreate = [];
        this.filesIds = [];
    },
    dividirBase() {
        if(this.baseConsolidada.length === 0) return false;
        for(let x = 0; x < this.baseConsolidada.length; x++){
            let date = this.getDatetoExcel(this.baseConsolidada[x]['MES']);
            if(!this.baseConsolidada[x]['PERFILAMIENTO_MES_ACTUAL'] || !this.baseConsolidada[x]['INFORME'] || !this.baseConsolidada[x]['ENTIDAD'] || !this.baseConsolidada[x]['PROVEEDOR']){
                continue;
            }
            let FileToPush = `${this.baseConsolidada[x]['ENTIDAD'] == 'No Aplica'? '' : this.baseConsolidada[x]['ENTIDAD']} ${this.baseConsolidada[x]['PROVEEDOR']} ${this.baseConsolidada[x]['PERFILAMIENTO_MES_ACTUAL']} ${date}`
            let tempData = {};
            for(let h in this.baseConsolidada[x]){
                tempData[h] = {
                    value: this.baseConsolidada[x][h],
                    style: {}
                }
            }
            if(this.fileExist(FileToPush)){
                // Buscamos el objeto
                this.filesToCreate.map(v => {
                    if(v.name == FileToPush){
                        v.data.push(tempData)
                    }
                })
            }else{ 
                // Creamos el objeto
                let fileInsert = {
                    name: FileToPush,
                    data: []
                }
                fileInsert.data.push(tempData);
                this.filesToCreate.push(fileInsert);
            }
        }
    },
    getDatetoExcel(XLSXTimestamp){
        if(typeof XLSXTimestamp != 'number'){
            return XLSXTimestamp;
        }
        let unix = ((XLSXTimestamp - 25569) * 86400) * 1000;
        let date = new Date(unix);
        let year = date.getUTCFullYear();
        let month = date.getUTCMonth() + 1;
        return `${month}-${year}`;
    },
    fileExist(fileName) {
        if(this.filesToCreate.length == 0) {
            return false;
        }else {
            let exists = false;
            this.filesToCreate.map(v => {
                if(v.name == fileName){
                    exists = true;
                }
            })
            if(exists) return true;
            else return false;
        }
    },
    async createFile(fileData) {
        // Creamos un archivo de perfilamiento
        let file = new includes.XLSX.XLSXFile(fileData.name + ".xlsx", 'analytics');
        
        // Sheet 1 (Usuarios)
        let users = new includes.XLSX.Sheet(file, fileData.name);
        let headers = Object.keys(fileData.data[0]);
        users.addHeaders(headers);
        // Agregamos los usuarios
        for(let x = 0; x < fileData.data.length; x++) {
            // Verificamos si el usuario existe en nuestra base
            let tempQuery = await includes.users.schema.find({id: fileData.data[x].DNI.value})

            if(tempQuery.length > 0) {
                users.addRow(fileData.data[x]);
            }
        }
        users.createSheet();

        // Sheet 2 (Cuartiles)
        let cuartiles = new includes.XLSX.Sheet(file, "Cuartiles");
        cuartiles.addHeaders([
            "Nombre del Cuartil",
            "Q1 | Cant",
            "Q1 | VMin",
            "Q1 | VMax",
            "Q2 | Cant",
            "Q2 | VMin",
            "Q2 | VMax",
            "Q3 | Cant",
            "Q3 | VMin",
            "Q3 | VMax",
            "Q4 | Cant",
            "Q4 | VMin",
            "Q4 | VMax",
        ])
        cuartiles.createSheet();

        // Sheet 3 (Grupos de perfilamiento)
        let perfilamiento = new includes.XLSX.Sheet(file, "Grupos de perfilamiento");
        perfilamiento.addHeaders([
            "Nombre del grupo",
            "Cant de agentes",
            "% Total",
            "Cluster",
            "assignAllUsers"
        ])
        perfilamiento.createSheet();

        file.save().then(v => {
            // Asignamos el programa al archivo 
            if(this.programtoAssign){
                programsModel.assignProgramtoPerfilamiento(v.id, this.programtoAssign).then(v => {v})
            }
            this.filesIds.push(v.id);
        })
    },
    /**
     * Devuelve los archivos existentes de perfilamientos ordenados por fecha
     */
    async getFiles(req) {
        let returnData = [];

        const rolesQueVenTodosLosArchivos = ["ADMINISTRATOR", "LIDER ON SITE", "COORDINADOR", "COORDINADOR OC"];

        if(!req) throw new Error('Error en permisos');

        let rol = req.authUser[0].role.role || false;
        let company = req.authUser[0].razonSocial || false;
        if(!rol) throw new Error('Error en permisos_2');

        let archivosPermitidos = [];
        let where = { section: 'analytics' }
        if(!(rolesQueVenTodosLosArchivos.includes(rol) && company === 'TELECOM')) {
            let programasPermitidos = await programsModel.get(req);
            for(let programa of programasPermitidos) {
                let files = await programsModel.getFileswithPrograms(programa.id);
                files.map(v => {
                    if (archivosPermitidos.indexOf(v) === -1) {
                        archivosPermitidos.push(v);
                    }
                })
            }
            where._id = { $in: archivosPermitidos };
        }
        
        let c = await includes.files.getAllFiles(where)
        // Buscamos los archivos
        
        let ordenado = c.sort((a,b) => b.updatedAt - a.updatedAt);

        for(let x = 0; x < ordenado.length; x++){
            // Consultamos el programa asignado
            let programa = await programsModel.getProgramtoPerfilamiento(c[x]._id);
            let tempData = {
                id: c[x]._id,
                name: c[x].name,
                date: c[x].updatedAt,
                program: programa
            }
            returnData.push(tempData);
        }

        return returnData;
    },
    async getColumns(id) {
        if(!id) throw new Error('ID No especificado')

        // Chequeamos si existe el archivo
        let c = await includes.files.checkExist(id);
        if(!c) throw new Error('Archivo inexistente');

        c = await includes.XLSX.XLSXFile.getData(c);
        if(c.length === 0) throw new Error('Archivo Vacio');
        let headers = c[0].data.headers;
        let rows    = c[0].data.rows;

        let columnsHide = ["id", "DNI", "LEGAJO", "APELLIDO Y NOMBRE", "SUPERVISOR", "RESPONSABLE", "GERENTE TERCERO", "GERENTE2", "CANAL", "CANALIDAD", "PROVEEDOR", "FECHA INGRESO", "MES", "INFORME", "GRUPO PA", "ENTIDAD", "PERFILAMIENTO_MES_ANTERIOR", "PERFILAMIENTO_MES_ACTUAL", "DETALLE_PA"]

        let returnData = []
        // sacamos las colummas que no mostraremos
        for(let x = 0; x < headers.length; x++){
            if(columnsHide.indexOf(headers[x]) >= 0) continue;
            if(headers[x].indexOf('#Q') >= 0) continue;
	        let tempData = {
                columnName: headers[x],
                VMax: 0,
                VMin: (1000000 * 1000000),
                DefaultValues: {
                    Q1: {
                        VMin: 0,
                        VMax: 0
                    },
                    Q2: {
                        VMax: 0
                    },
                    Q3: {
                        VMax: 0
                    },
                    Q4: {
                        VMax: 0
                    }
                }
            }

            let usersCount = rows.length;
            let UsersbyQ = usersCount / 4;
            let usersQ1 = parseInt(UsersbyQ);
            let usersQ2 = parseInt(UsersbyQ);
            let usersQ3 = parseInt(UsersbyQ);
            let usersQ4 = usersCount - (parseInt(UsersbyQ) * 3);

            let AllValues = []
            /**
             * Guardamos los valores en un array
             */
            for(let d = 0; d < usersCount; d++){
                let value = rows[d][tempData.columnName];
                value = parseFloat(value);
                if(isNaN(value)) continue;
                AllValues.push(value);
                if(value > tempData.VMax){
                    tempData.VMax = value;
                    tempData.DefaultValues.Q4.VMax = value;
                }
                if(value < tempData.VMin){
                    tempData.VMin = value;
                    tempData.DefaultValues.Q1.VMin = value;
                }
            }

            if(tempData.VMax !== 1 || tempData.VMin !== 0) {
                // solo divide los valores por usuarios en caso que los valores maximos y minimos no sean 0 y 1, 
                // Si es 1 entendemos que estamos hablando de campos booleanos como sustentable o grupo_anterior

                // Ordenamos los valores en desc
                AllValues = AllValues.sort((a, b) => a - b);

                let value;
                for(let q1 = 0; q1 < usersQ1; q1++) {
                    value = AllValues[q1]
                    if(value >= tempData.DefaultValues.Q1.VMax) {
                        tempData.DefaultValues.Q1.VMax = value;
                    }
                }
                for(let q2 = usersQ1; q2 < (usersQ2 * 2); q2++) {
                    value = AllValues[q2]
                    if(value >= tempData.DefaultValues.Q2.VMax) {
                        tempData.DefaultValues.Q2.VMax = value;
                    }
                }
                for(let q3 = usersQ2; q3 < (usersQ3 * 3); q3++) {
                    value = AllValues[q3]
                    if(value >= tempData.DefaultValues.Q3.VMax) {
                        tempData.DefaultValues.Q3.VMax = value;
                    }
                }
            } else {
                // Si no dividimos por usuarios entonces, solo lo dividimos en bloques iguales de 0,25
                let bloques = tempData.VMax / 4;
                tempData.DefaultValues.Q1.VMax = bloques * 1;
                tempData.DefaultValues.Q2.VMax = bloques * 2;
                tempData.DefaultValues.Q3.VMax = bloques * 3;
            }



            /**
             * Le sacamos el redondeo para que no de error
             */
            // tempData.VMax = parseFloat(tempData.VMax.toFixed(4))
            // tempData.VMin = parseFloat(tempData.VMin.toFixed(4))

            if(tempData.VMin > tempData.VMax) {
                tempData.VMin = 0;
            } else if(tempData.VMax === tempData.VMin) {
                tempData.VMax = tempData.VMin + 1;
            }

            tempData.DefaultValues.Q4.VMax = tempData.VMax;
            tempData.DefaultValues.Q1.VMin = tempData.VMin;

            // if(tempData.VMin >= tempData.VMax) continue;

            returnData.push(tempData)
        }

        return returnData;
    },
    async getUserInfo(fileId) {
        if(fileId){
            const File = await includes.files.getAllFiles({_id: fileId});
            if(File.length === 0) return false;
            const FData = await includes.XLSX.XLSXFile.getData({path: File[0].path});
            let returnData = [];
            FData.map(value => {
                if(value.name !== 'Cuartiles' && value.name !== 'Grupos de perfilamiento'){
                    value.data.rows.map(user => {
                        returnData = [...returnData, user]
                    })
                }
            })

            return returnData;
        }
        return "";
    }
}


module.exports = PerfilamientoFile;
