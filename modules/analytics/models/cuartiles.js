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

const XLSXdatabase  = require('./XLSXdatabase');
const perfilamientoFile = require('./perfilamientoFile');

// Cuartiles COlors
const CQ1 = "00ff00";
const CQ2 = "ffcc00";
const CQ3 = "ff9900";
const CQ4 = "ff0000";

const Cuartiles = {
    file: "",
    oldData: [],
    newData: [],
    cuartiles: [],
    async modify(fileId, data){
        this.init();
        if(!fileId, data.length === 0) throw new Error('Error en los parametros')
        let c = await includes.files.checkExist(fileId);
        this.file = c;
        
        c = await includes.XLSX.XLSXFile.getData(this.file);
        this.oldData = c;

        // creamos los cuartiles
        for(let crt = 0; crt < data.length; crt++){
            let cuartilActual = data[crt];
            if(!cuartilActual.QName || !cuartilActual.Qorder || !cuartilActual.Q1 || !cuartilActual.Q4 || cuartilActual.Q1.VMin === undefined || cuartilActual.Q4.VMax === undefined) throw new Error('Error en los parametros enviados del cuartil')
            let bloques = (cuartilActual.Q4.VMax - cuartilActual.Q1.VMin) / 4; 
        
            let tempData = {
                order: cuartilActual.Qorder,
                name: cuartilActual.QName,
                Q1: {
                    cant: 0,
                    VMin: cuartilActual.Q1.VMin || 0,
                    VMax: 0
                },
                Q2: {
                    cant: 0,
                    VMin: 0,
                    VMax: 0
                },
                Q3: {
                    cant: 0,
                    VMin: 0,
                    VMax: 0
                },
                Q4: {
                    cant: 0,
                    VMin: 0,
                    VMax: cuartilActual.Q4.VMax
                }
            }
            tempData.Q1.VMax = cuartilActual.Q1.VMax ? cuartilActual.Q1.VMax : tempData.Q1.VMin + bloques;
            tempData.Q2.VMin = tempData.Q1.VMax;
            tempData.Q2.VMax = cuartilActual.Q2 && cuartilActual.Q2.VMax ? cuartilActual.Q2.VMax : tempData.Q2.VMin + bloques;
            tempData.Q3.VMin = tempData.Q2.VMax;
            tempData.Q3.VMax = cuartilActual.Q2 && cuartilActual.Q2.VMax ? cuartilActual.Q3.VMax : tempData.Q3.VMin + bloques;
            tempData.Q4.VMin = tempData.Q3.VMax
            this.cuartiles.push(tempData)
        }  

        // Asignamos los valores a los usuarios y los cuartiles
        this.createNewData();
        return this.updateXLSX();
    },
    async updateXLSX() {
        // Creamos un archivo de perfilamiento
        let file = new includes.XLSX.XLSXFile(this.file.name, 'analytics');

        for(let sh = 0; sh < this.newData.length; sh++){
            let hoja = this.newData[sh];
            let temp = new includes.XLSX.Sheet(file, hoja.name);
            temp.addHeaders(hoja.data.headers);
            for(let x = 0; x < hoja.data.rows.length; x++) {     
                temp.addRow(hoja.data.rows[x]);
            }
            temp.createSheet();
        }
        return file.save(this.file.path).then(v => {
            return v
        })
    },
    init() {
        this.file = "";
        this.oldData = [];
        this.newData = [];
        this.cuartiles = [];
    },
    /**
     * Retorna un objeto con los nombres de columnas 
     */
    buildCuartiles(){
        let returnData = [];
        for(let o = 0; o < this.cuartiles.length; o++){
            let cuartil = this.cuartiles[o];
            if(cuartil.order == 'ASC'){
                // Solo invertimos los VMax y VMin
                tempData = {
                    'Nombre del Cuartil': {
                        value: cuartil.name,
                        style: {}
                    },
                    "Q1 | Cant": {value: cuartil.Q1.cant, style: {}},
                    "Q1 | VMin": {value: cuartil.Q4.VMin, style: {}},
                    "Q1 | VMax": {value: cuartil.Q4.VMax, style: {}},
                    "Q2 | Cant": {value: cuartil.Q2.cant, style: {}},
                    "Q2 | VMin": {value: cuartil.Q3.VMin, style: {}},
                    "Q2 | VMax": {value: cuartil.Q3.VMax, style: {}},
                    "Q3 | Cant": {value: cuartil.Q3.cant, style: {}},
                    "Q3 | VMin": {value: cuartil.Q2.VMin, style: {}},
                    "Q3 | VMax": {value: cuartil.Q2.VMax, style: {}},
                    "Q4 | Cant": {value: cuartil.Q4.cant, style: {}},
                    "Q4 | VMin": {value: cuartil.Q1.VMin, style: {}},
                    "Q4 | VMax": {value: cuartil.Q1.VMax, style: {}}
                }
            }else{
                tempData = {
                    'Nombre del Cuartil': {value: cuartil.name, style: {}},
                    "Q1 | Cant": {value: cuartil.Q1.cant, style: {}},
                    "Q1 | VMin": {value: cuartil.Q1.VMin, style: {}},
                    "Q1 | VMax": {value: cuartil.Q1.VMax, style: {}},
                    "Q2 | Cant": {value: cuartil.Q2.cant, style: {}},
                    "Q2 | VMin": {value: cuartil.Q2.VMin, style: {}},
                    "Q2 | VMax": {value: cuartil.Q2.VMax, style: {}},
                    "Q3 | Cant": {value: cuartil.Q3.cant, style: {}},
                    "Q3 | VMin": {value: cuartil.Q3.VMin, style: {}},
                    "Q3 | VMax": {value: cuartil.Q3.VMax, style: {}},
                    "Q4 | Cant": {value: cuartil.Q4.cant, style: {}},
                    "Q4 | VMin": {value: cuartil.Q4.VMin, style: {}},
                    "Q4 | VMax": {value: cuartil.Q4.VMax, style: {}}
                }
            }
            returnData.push(tempData);
        }
        return returnData;
    },
    createNewData(){
        // Incluimos los headers de usuarios menos los que se llamen como #Quartil y asignamos las nuevas columnas de cuartiles
        if(this.oldData[0]){
            let tempData = {
                name: this.oldData[0].name,
                data: {
                    headers: [],
                    rows: []
                }
            }
            // headers
            let crearCuartil = false;
            for(let i = 0; i < this.oldData[0].data.headers.length; i++){
                if(crearCuartil){
                    tempData.data.headers.push(`#Quartil ${crearCuartil}`)
                    crearCuartil = false;
                    i = i--; // Restamos la iteracion para no perder columnas
                } else{
                    let header = this.oldData[0].data.headers[i]
                    if(header.indexOf('#Quartil') >= 0) continue;
                    if(header == 'id') continue;
                    // Chequeamos si la columna se llama igual que algun cuartil
                    for(let c = 0; c < this.cuartiles.length; c++){
                        let cuartil = this.cuartiles[c]; 
                        if(header.indexOf(cuartil.name) >= 0){
                            // Creamos una columna en la proxima iteracion
                            crearCuartil = cuartil.name;
                        }
                    }
    
                    tempData.data.headers.push(header);
                }
            }

            // rows
            for(i = 0; i < this.oldData[0].data.rows.length; i++){
                let user = this.oldData[0].data.rows[i];
                let userData = {};
                for(let h = 0; h < tempData.data.headers.length; h++){
                    let header = tempData.data.headers[h];
                    if(header.indexOf('#Quartil') >= 0){
                        // Consultamos el nombre del cuartil
                        let cuartil = header.split(' ');
                        let columna = "";
                        for(let col = 1; col < cuartil.length; col++){
                            columna += cuartil[col];
                        }
                        
                        // Buscamos el valor de la columna y le asignamos un cuartil
                        userData[header] = {
                            value: this.assignuserToCuartil(columna,userData[columna]),
                            style: {}
                        }
                    }else {
                        userData[header] = {
                            value: user[header],
                            style: {}
                        }
                    }
                    
                }
                // Assign style to columns with Q1 Q2 Q3 Q4
                userData = this.assignStyle(userData);
                tempData.data.rows.push(userData);
            }
            this.newData.push(tempData)
        }

        // incluimos al nuevo grupo los datos de grupos de perfilamiento
        for(let x = 1; x < this.oldData.length; x++){
            let tempData = {
                name: this.oldData[x].name,
                data: {
                    headers: [],
                    rows: []
                }
            }
            for(let g = 0; g < this.oldData[x].data.headers.length; g++){
                let header = this.oldData[x].data.headers[g];
                if(header == 'id') continue;
                tempData.data.headers.push(header)
            }
            if(this.oldData[x].name == 'Cuartiles'){
                tempData.data.rows = this.buildCuartiles();
            }else {
                tempData.data.rows = this.oldData[x].data.rows;
            }
            this.newData.push(tempData);
        }
    },
    assignStyle(value) {
        // console.log(value)
        let eraseCuartilName = (headerName) => {
            if(headerName.indexOf('#Quartil') >= 0){
                // Consultamos el nombre del cuartil
                let cuartil = headerName.split(' ');
                let columna = "";
                for(let col = 1; col < cuartil.length; col++){
                    columna += cuartil[col];
                }
                return columna;
            }
            return false;            
        }

        for(let header in value){
            let color = "";
            switch(value[header].value){
                case 'Q1': // Green
                        color = CQ1 
                    break;
                case 'Q2': // Yellow
                        color = CQ2   
                    break;
                case 'Q3': // Orange
                        color = CQ3 
                    break;
                case 'Q4': // Red
                        color = CQ4  
                    break;
            }
            if(color){
                let parentColumn = eraseCuartilName(header);
                value[header].style = {
                    fill: {
                        type: 'pattern',
                        patternType: 'solid',
                        fgColor: color
                    }
                }   
                value[parentColumn].style = {
                    fill: {
                        type: 'pattern',
                        patternType: 'solid',
                        fgColor: color
                    }
                }   
                color = "";
            }
        }
        return value;
    },
    /**
     * Esta funcion devuelve al cuartil que pertenece ese valor y suma al cant en el objeto cuartiles
     */
    assignuserToCuartil(column, value){
        let dataReturn = "";
        let temp = "";
        if(column && value){
            // Buscamos el cuartil
            for(let c = 0; c < this.cuartiles.length; c++){
                var cuartil = this.cuartiles[c];
                if(cuartil.name == column){
                    for(let q in cuartil){
                        if(q.indexOf('Q') >= 0){
                            if(q != 'Q4' && value.value >= cuartil[q].VMin && value.value < cuartil[q].VMax){
                                temp = q;
                            }else if(q == 'Q4' && value.value >= cuartil[q].VMin && value.value <= cuartil[q].VMax){
                                temp = q;
                                
                            }

                            if(temp){
                                if(cuartil.order == 'ASC'){
                                    switch(q){
                                        case "Q1":
                                                q = "Q4";
                                            break;
                                        case "Q2":
                                                q = "Q3";
                                            break;
                                        case "Q3":
                                                q = "Q2";
                                            break;
                                        case "Q4":
                                                q = "Q1";
                                            break;
                                    }
                                    dataReturn = q;
                                }else{
                                    dataReturn = temp;
                                }
                                cuartil[q].cant++;
                                temp = "";
                            }
                            


                        }
                    }
                }
            }
        }
        return dataReturn;
    }
}


module.exports = Cuartiles;