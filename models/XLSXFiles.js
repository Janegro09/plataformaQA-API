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
/** ------------------------------------- Ejemplo de uso --------------------------------------------- */

// const XLSXFile = require('./models/XLSXFiles');
// const exampleFile = new XLSXFile.XLSXFile('Datos');
// const exampleSheet = new XLSXFile.Sheet(exampleFile, "Numeros");
// // Agrego columnas
// exampleSheet.addHeaders(["Nombre", "Apellido", "Telefono", "Mail"])
// // Agrego filas 
// for(let i = 0; i < 100; i++) {
//     exampleSheet.addRow({
//         Nombre: "Ramiro",
//         Apellido: "Macciuci",
//         Telefono: 1121742416,
//         Mail: "ramimacciuci@gmail.com"
//     })
// }
// exampleSheet.createSheet();
// exampleFile.save().then(v => {
//     console.log(v)
// })

/** --------------------------------------------------------------------------------------------------------- */


const helper        = require('../controllers/helper');
const fs            = require('fs');
const excelNode     = require('excel4node');
const filesModel    = require('../controllers/files');
const xlsx          = require('node-xlsx');
const { set }       = require('mongoose');
const workbook      = require('excel4node/distribution/lib/workbook');

class XLSXFile {
    constructor(fileName, section = "analytics"){
        if(fileName){
            this.fileName = fileName;
        }
        this.section = section;
        this.fileType = "xlsx"
        this.pathFile = `${global.baseUrl}/../files/${this.section}/${this.fileType}/`;
        this.sheets = [];
    }

    async save() {
        // Creamos la carpeta files si no existe
        if(!helper.files.exists(global.baseUrl + '/../files', true)){
            fs.mkdirSync(global.baseUrl + '/../files', '0775');
        }
        if(!helper.files.exists(global.baseUrl + '/../files/' + this.section, true)){
            fs.mkdirSync(global.baseUrl + '/../files/'+this.section, '0775');
        }
        if(!helper.files.exists(this.pathFile, true)){
            fs.mkdirSync(this.pathFile, '0775');
        }

        let workBook = new excelNode.Workbook();
    
         // Creamos sheets
        const sheets = this.sheets;
        for(let i = 0; i < sheets.length; i++){
            let actualSheet = sheets[i];
            let colCounts = actualSheet.headers.length;
            let rowCounts = actualSheet.rows.length;
            let sheet = workBook.addWorksheet(actualSheet.name);
            // let sheet = workBook.createSheet(actualSheet.name, colCounts, (rowCounts + 1));
          
            // Creamos el row header
            let col = 1;
            let row = 1;
            for(let head = 0; head < colCounts; head++){
                let style = {};
                let h = actualSheet.headers[head]
                sheet.cell(row, col).string(h).style(style)
                col++
            }
            // Almacenamos todas las filas
            row++
            for(let r = 0; r < rowCounts; r++){
                col = 1;
                for(let c = 0; c < colCounts; c++){
                     let value = 0;
                     let style = {};
                    // Si no es un objeto es porque es el ID
                    if(typeof actualSheet.rows[r][c] != 'object'){
                        value = actualSheet.rows[r][c]
                    }else{
                        value = actualSheet.rows[r][c].value
                    }
                    if(actualSheet.rows[r][c].style){
                        style = actualSheet.rows[r][c].style
                    }
                    if(typeof value === 'number' && !isNaN(value)){
                        sheet.cell(row, col).number(value).style(style)
                    }else{
                        value = value.toString();
                        sheet.cell(row, col).string(value).style(style)
                    }
                    col++
                }
                row++
            }
        }
        if(helper.files.exists(this.pathFile + this.fileName,false)){
            await helper.files.delete(this.pathFile + this.fileName);
            await workBook.write(this.pathFile + this.fileName);

            return await filesModel.get(this.section,this.fileType,this.fileName);
            // return await filesModel.getIdSaveFile(this.section,this.fileType,this.fileName)
        }else{
            await workBook.write(this.pathFile + this.fileName);
            return await filesModel.getIdSaveFile(this.section,this.fileType,this.fileName)
        }
    
    }

    static async getData(fileObject) {
        if(!fileObject) throw new Error('Objeto del archivo no definido - XLSXFiles')
        // Consultamos si existe el archivo 
        if(!helper.files.exists(fileObject.path)) throw new Error('Archivo inexistente');

        const file = await xlsx.parse(fs.readFileSync(fileObject.path));
        let returnData = []
        for(let s = 0; s < file.length; s++){
            // Convertimos la data a json
            let sheet = {
                name: file[s].name,
                data: {
                    headers: [],
                    rows: []
                }
            };
            const data = file[s].data
    
            const headers = data[0];
            sheet.data.headers = headers;
    
            for(let row = 1; row < data.length; row++) {
                let tempData = {};
                for(let h = 0; h < headers.length; h++){
                    tempData[headers[h]] = data[row][h]
                }
                sheet.data.rows.push(tempData);
            }
            returnData.push(sheet);
        }

        return returnData
    }
}

class Sheet extends XLSXFile {
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
                if(data[x].value === undefined){
                    let value = false;
                    if(data[x] && typeof data[x] !== 'object') {
                        value = data[x];
                    } else if(data[x] === 0) {
                        value = data[x];
                    }
                    data[x] = { style: data[x].style || '' };
                    data[x].value = value || value === 0 ? value : '-';
                }
                if(typeof data[x].value === 'string' || typeof data[x].value === 'number'){
                    dataOrdenada[c.id] = data[x]
                } else if(typeof data[x].value === 'boolean') {
                    dataOrdenada[c.id] = {
                        value: data[x].value ? 'SI' : 'NO',
                        style: data[x].style
                    }
                } else{
                    throw new Error('Datos no aceptados. Columna: ' + x + ". Tipo de dato erroneo: " + data[x] + '|' + data[x].value + '|' + typeof data[x].value );
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