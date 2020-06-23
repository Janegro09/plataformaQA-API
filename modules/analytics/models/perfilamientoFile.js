/**
 * @fileoverview Modulo Programs
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


const PerfilamientoFile = {
    /**
     * Funcion para dividir la base consolidada en varios registros
     */
    baseConsolidada: [],
    programtoAssign: false,
    filesToCreate: [],
    filesIds: [],
    async dividirBaseConsolidada(files, program) {
        // Dividimos el array en varias bases
        this.baseConsolidada = files;
        this.programtoAssign = program;
        this.dividirBase();

        // Creamos los archivos
        // console.log(this.filesToCreate.length);

        for(let x = 0; x < this.filesToCreate.length; x++){
            this.createFile(this.filesToCreate[x]);
        }

        return this.filesIds.length;
    },
    dividirBase() {
        if(this.baseConsolidada.length === 0) return false;
        for(let x = 0; x < this.baseConsolidada.length; x++){
            let date = this.getDatetoExcel(this.baseConsolidada[x]['MES']);
            if(this.baseConsolidada[x]['PERFILAMIENTO_MES_ACTUAL'] == "" || this.baseConsolidada[x]['INFORME'] == ''){
                continue;
            }
            let FileToPush = `${this.baseConsolidada[x]['INFORME']} ${this.baseConsolidada[x]['PROVEEDOR']} ${this.baseConsolidada[x]['PERFILAMIENTO_MES_ACTUAL']} ${date}`
            let tempData = {};
            for(let h in this.baseConsolidada[x]){
                tempData[h] = this.baseConsolidada[x][h];
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
    createFile(fileData) {
        // Creamos un archivo de perfilamiento
        let file = new includes.XLSX.XLSXFile(fileData.name, 'analytics');
        
        // Sheet 1 (Usuarios)
        let users = new includes.XLSX.Sheet(file, fileData.name);
        let headers = Object.keys(fileData.data[0]);
        users.addHeaders(headers);
        // Agregamos los usuarios
        for(let x = 0; x < fileData.data.length; x++) {
            users.addRow(fileData.data[x]);
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
            "Cluster"
        ])
        perfilamiento.createSheet();

        file.save().then(v => {
            this.filesIds.push(v.id);
        })
    }
}


module.exports = PerfilamientoFile;