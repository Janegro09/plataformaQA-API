/**
 * @fileoverview Models | Modelo para crear archivos XLS
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

const helper  = require('../controllers/helper');
const fs      = require('fs');
const filesModel = require('../database/migrations/Files');
const { set } = require('mongoose');

class XLSXFile {
    constructor(fileName, section = "perfilamiento"){
        if(fileName){
            this.fileName = fileName + ".xlsx";
        }
        this.pathFile = `${global.baseUrl}/../files/${section}`;
        this.sheets = [];
    }

    save() {
        // Creamos la carpeta files si no existe
        if(!helper.files.exists(global.baseUrl + '/../files', true)){
            fs.mkdirSync(global.baseUrl + '/../files', '0775');
        }
        if(!helper.files.exists(this.pathFile, true)){
            fs.mkdirSync(this.pathFile, '0775');
        }
        // let workBook = msexcel.createWorkbook(this.pathFile + '/', this.fileName);
    
        // // Creamos sheets
        // const sheets = this.sheets;
        // for(let i = 0; i < sheets.length; i++){
        //     let actualSheet = sheets[i];
        //     let colCounts = actualSheet.headers.length;
        //     let rowCounts = actualSheet.rows.length;

        //     let sheet = workBook.createSheet(actualSheet.name, colCounts, (rowCounts + 1));
            
        //     // Creamos el row header
        //     let col = 1;
        //     let row = 1;
        //     for(let head = 0; head < colCounts; head++){
        //         sheet.set(col,row,actualSheet.headers[head]);
        //         col++
        //     }

        //     // Almacenamos todas las filas
        //     row++
        //     for(let r = 0; r < rowCounts; r++){
        //         col = 1;
        //         for(let c = 0; c < colCounts; c++){
        //             sheet.set(col,2,actualSheet.rows[r][c]);
        //             col++
        //         }
        //         row++
        //     }
        // }

        // console.log(workBook)
        // workBook.save(function(ok){
        //     if (!ok) {
        //         console.log(ok);
        //         workBook.cancel();
        //     } else{
        //         console.log('congratulations, your workbook created')
        //     }
        // });
    
    }
}

class Sheet extends XLSXFile {
    // constructor(){
    //     // this.rows = [];
    //     // this.headers = [];
    // }
    constructor(parent, name) {
        if(!name || !parent) throw new Error('Error en los parametros');
        super(parent)
        this.rows = [];
        this.name = name;
        this.headers = [{
            id: 0,
            name: "id"
        }];
        this.parent = parent;
    }

    /**
     * 
     * @param {Array} Array 
     * array con los nombres de las columnas ["columna1", "columna2", "columna3"]
     */
    addHeaders(Array) {
        // Agregamos headers al array headers
        Array.map((v,i) => {
            let tempData = {
                id: i + 1,
                name: v
            }
            this.headers.push(tempData)
        })
    }

    /**
     * 
     * @param {object} data 
     * 
     * funcion para agregar una fila
     * enviamos en el objeto {headerName: data, headerName2: data}
     */
    addRow(data) {
        // Agregamos una nueva fila con nuevo id
        let row = [this.rows.length + 1];
        let dataOrdenada = {};

        // Creamos un objeto ordenado segun los headers
        for(let x in data){
            let c
            if(c = this.getColData(x)){
                if(typeof data[x] === 'string' || typeof data[x] === 'number'){
                    dataOrdenada[c.id] = data[x]
                }else{
                    throw new Error('Datos no aceptados. Columna: ' + x + ". Tipo de dato erroneo: " + typeof data[x] );
                }
            }
        }

        let contador = 1;
        while(this.headers.length > contador){
            let tempData = dataOrdenada[contador];
            if(tempData){
                row.push(tempData);
            }else{
                row.push("");
            }
            contador++;
        }
        this.rows.push(row);
    }

    getColData (colName) {
        for(let i = 0; i < this.headers.length; i++){
            if(this.headers[i].name === colName){
                return this.headers[i]
            }
        }
        return false;
    }

    /**
     * Funcion que crea un objeto en this.parent.sheets (crea una hoja nueva)
     * 
     * Es decir: junta this.rows y this.headers y las ordena
     */
    createSheet () {
        let headers = [];
        for(let i in this.headers){
            headers.push(this.headers[i].name);
        }

        let sheetStx = {
            name: this.name,
            headers: headers,
            rows: this.rows
        }

        this.parent.sheets.push(sheetStx);
    }
}

module.exports = {
    XLSXFile: XLSXFile,
    Sheet: Sheet
}