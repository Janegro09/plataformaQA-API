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
            console.log(cuartil.order)
            if(cuartil.order == 'ASC'){
                tempData = {
                    'Nombre del Cuartil': cuartil.name,
                    "Q1 | Cant": cuartil.Q4.cant,
                    "Q1 | VMin": cuartil.Q4.VMin,
                    "Q1 | VMax": cuartil.Q4.VMax,
                    "Q2 | Cant": cuartil.Q3.cant,
                    "Q2 | VMin": cuartil.Q3.VMin,
                    "Q2 | VMax": cuartil.Q3.VMax,
                    "Q3 | Cant": cuartil.Q2.cant,
                    "Q3 | VMin": cuartil.Q2.VMin,
                    "Q3 | VMax": cuartil.Q2.VMax,
                    "Q4 | Cant": cuartil.Q1.cant,
                    "Q4 | VMin": cuartil.Q1.VMin,
                    "Q4 | VMax": cuartil.Q1.VMax
                }
            }else{
                tempData = {
                    'Nombre del Cuartil': cuartil.name,
                    "Q1 | Cant": cuartil.Q1.cant,
                    "Q1 | VMin": cuartil.Q1.VMin,
                    "Q1 | VMax": cuartil.Q1.VMax,
                    "Q2 | Cant": cuartil.Q2.cant,
                    "Q2 | VMin": cuartil.Q2.VMin,
                    "Q2 | VMax": cuartil.Q2.VMax,
                    "Q3 | Cant": cuartil.Q3.cant,
                    "Q3 | VMin": cuartil.Q3.VMin,
                    "Q3 | VMax": cuartil.Q3.VMax,
                    "Q4 | Cant": cuartil.Q4.cant,
                    "Q4 | VMin": cuartil.Q4.VMin,
                    "Q4 | VMax": cuartil.Q4.VMax
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
                    tempData.data.headers.push(`#Quartil ${crearCuartil}`);
                    crearCuartil = false;
                    i = i--; // Restamos la iteracion para no perder columnas
                } else{
                    let header = this.oldData[0].data.headers[i];
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
                        userData[header] = this.assignuserToCuartil(columna,userData[columna]);
                    }else {
                        userData[header] = user[header];
                    }
                }
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
    /**
     * Esta funcion devuelve al cuartil que pertenece ese valor y suma al cant en el objeto cuartiles
     */
    assignuserToCuartil(column, value){
        let dataReturn = "";
        if(column && value){
            // Buscamos el cuartil
            for(let c = 0; c < this.cuartiles.length; c++){
                let cuartil = this.cuartiles[c];
                if(cuartil.name == column){
                    for(let q in cuartil){
                        if(q.indexOf('Q') >= 0){
                            if(q != 'Q4' && value >= cuartil[q].VMin && value < cuartil[q].VMax){
                                dataReturn = q;
                                cuartil[q].cant++;
                            }else if(q == 'Q4' && value >= cuartil[q].VMin && value <= cuartil[q].VMax){
                                dataReturn = q;
                                cuartil[q].cant++;
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