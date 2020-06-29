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

const cuartilesModel = require('./cuartiles')

const cuartilesGroups = {
    file: "",
    oldData: [],
    newData: [],
    groups: [],
    assignedUsers: [],
    async cuartilesGroups(fileId, data) {
        this.init();
        if(!fileId, data.length === 0) throw new Error('Error en los parametros')
        let c = await includes.files.checkExist(fileId);
        if(!c) throw new Error('Archivo inexistente')
        this.file = c;
        
        c = await includes.XLSX.XLSXFile.getData(this.file);
        this.oldData = c;

        this.copyUsersCuartilesSheets();
        for(let gc = 0; gc < data.length; gc++){
            // Chequeamos las columnas requeridas
            let actual = data[gc]
            if(!actual.name || actual.cuartilAssign.length === 0 || !actual.cluster) throw new Error('Error en los parametros enviados');


            let tempData = {
                'Nombre del grupo': actual.name,
                'Cant de agentes': 0,
                '% Total': 0,
                'Cluster': this.checkCluster(actual.cluster)
            }

            // Asignamos los cuartiles a los grupos
            for(let c = 0; c < actual.cuartilAssign.length; c++){
                let cuartilEspecifico = actual.cuartilAssign[c];
                if(!this.searchornewColumn(cuartilEspecifico.cuartil)) continue;
                console.log(cuartilEspecifico)
            }
            this.searchornewColumn('ATENDIDAS');
            console.log(tempData);
            // let tempData
        }
        // console.log(data)
    },
    init(){
        this.file           = "";
        this.oldData        = [];
        this.newData        = [];
        this.groups         = [];
        this.assignedUsers  = [];
    },
    /**
     * Esta funcion busca si existe el cuartil detallado y crea la columna
     * @param {String} columnName 
     */
    searchornewColumn(columnName) {
        if(!columnName) return false;
        let existsincuartilSheet = "";
        let existsingc = true;
        // Buscamos el cuartil
        this.newData.map(v => {
            // Buscamos si existe en la hoja de cuartiles 
            if(v.name === 'Cuartiles'){
                for(let i = 0; i < v.data.rows.length; i++){
                    let cuartil = v.data.rows[i];
                    if(cuartil['Nombre del Cuartil'].value == columnName){
                        existsincuartilSheet = columnName;
                    }
                }
            }else if(v.name === 'Grupos de perfilamiento'){
                // Buscamos si ya existe creado en el header
                if(v.data.headers.indexOf(columnName) === -1){
                    existsingc = false;
                }
            }
        })
        if(!existsincuartilSheet) return false;
        if(existsincuartilSheet && existsingc) return true;

        // Creamos la nueva columna
        this.newData.map(v => {
            if(v.name === 'Grupos de perfilamiento'){
                // Buscamos si ya existe creado en el header
                v.data.headers.push(columnName)
            }
        })

        return true;
    },
    checkCluster(name) {
        const AuthorizedNames = [
            "Convergente",
            "Mantenimiento",
            "Benchmark",
            "Comportamental",
            "Sustentable",
            "Desarrollo"
        ]

        if(AuthorizedNames.indexOf(name) >= 0){
            return name;
        }else{
            return "No especificado";
        }
    },
    copyUsersCuartilesSheets(){
        for(let x = 0; x < this.oldData.length; x++){

            let tempData = {
                name: this.oldData[x].name,
                data: {
                    headers: [],
                    rows: []
                }
            }
            // headers
            for(let i = 0; i < this.oldData[x].data.headers.length; i++){
                let header = this.oldData[x].data.headers[i]
                if(header == 'id') continue;
                
                // Ignoramos los headers que comienzan con # en grupos de perfilamiento
                if(this.oldData[x].name == 'Grupos de perfilamiento' && header.indexOf('#') === 0) continue;

                // Chequeamos si la columna se llama igual que algun cuartil
                tempData.data.headers.push(header);
            }
            if(this.oldData[x].name != 'Grupos de perfilamiento') {
                for(i = 0; i < this.oldData[x].data.rows.length; i++){
                    let user = this.oldData[x].data.rows[i];
                    let data = {};
                    for(let h = 0; h < tempData.data.headers.length; h++){
                        let header = tempData.data.headers[h];
                        if(header === 'Grupos de cuartiles Asignados') continue;
                        data[header] = {
                            value: user[header],
                            style: {}
                        }
                    }
                    //Assign style to columns with Q1 Q2 Q3 Q4
                    if(this.oldData[x].name != 'Cuartiles'){
                        data = cuartilesModel.assignStyle(data);
                    }
                    tempData.data.rows.push(data);
                }   
            }
            this.newData.push(tempData)
        }
    }
}

module.exports = cuartilesGroups;