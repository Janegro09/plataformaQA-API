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
    dividirBaseConsolidada(files, program) {
        // Dividimos el array en varias bases
        this.baseConsolidada = files;
        this.programtoAssign = program;
        this.dividirBase();

        console.log(this.filesToCreate.length);

        this.filesToCreate.map(v => {
            if(v.data.length < 10){
                console.log(v.name);
            }
        })


        // console.log(this.filesToCreate)

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
    }
}


module.exports = PerfilamientoFile;