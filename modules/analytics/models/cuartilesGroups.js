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
    totalUsers: [],
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
            let assignAllUsers = actual.AssignAllUsers;
            let tempData = {
                'Nombre del grupo': {value: actual.name, style: ""},
                'Cant de agentes': {value: 0, style: ""},
                'Cluster': {value: this.checkCluster(actual.cluster), style: ""},
                'assignAllUsers': {value: assignAllUsers ? 'SI' : 'NO', style: ""}
            }

            // Asignamos los cuartiles a los grupos
            for(let c = 0; c < actual.cuartilAssign.length; c++){
                let cuartilEspecifico = actual.cuartilAssign[c];
                if(cuartilEspecifico.Q <= 0 && cuartilEspecifico.Q > 4) throw new Error('Los valores de Q van de 1 a 4');
                if(!this.searchornewColumn(cuartilEspecifico.cuartil)) continue;
                let users = this.usersToCuartil(cuartilEspecifico);
                if(!tempData[cuartilEspecifico.cuartil]){
                    tempData[cuartilEspecifico.cuartil] =  {value: `Q${cuartilEspecifico.Q}`, style: ""};
                }else if(tempData[cuartilEspecifico.cuartil].value.length){
                    tempData[cuartilEspecifico.cuartil].value += ` + Q${cuartilEspecifico.Q}`;
                }

                // Asignar usuarios al array de usuarios asignados y si el usuario ya existe no podra reasignarse
                for(let l = 0; l < users.length; l++){
                    if(this.assignedUsers.indexOf(users[l]) === -1 && !assignAllUsers){
                        tempData['Cant de agentes'].value++;
                        this.assignGCtoUser(users[l], tempData['Nombre del grupo'].value);
                        this.assignedUsers.push(users[l]) // Asignamos los usuarios al array
                    }else if(assignAllUsers){
                        tempData['Cant de agentes'].value++;
                        this.assignGCtoUser(users[l], tempData['Nombre del grupo'].value);
                    }
                }
            }

            // Sacamos el porcentaje del total
            let porcentaje  = (100 * tempData['Cant de agentes'].value) / this.totalUsers.length;
            porcentaje      = parseFloat(porcentaje.toFixed(2))
            tempData['% Total'] = {
                value: porcentaje,
                style: ""
            }

            // Asignamos la data en la hoja de grupos de perfilamiento
            this.newData.map(v => {
                // Buscamos si existe en la hoja de cuartiles 
                if(v.name === 'Grupos de perfilamiento'){
                    // Buscamos si ya existe creado en el header
                    v.data.rows.push(tempData);
                }
            })
        }

        // Creamos el archivo
        return this.updateXLSX();
    },
    async updateXLSX(){
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
    assignGCtoUser(userId, groupName){
        this.newData.map(v => {
            if(v.name !== 'Grupos de perfilamiento' && v.name !== 'Cuartiles'){
                // Buscamos si existe la columna de grupos de cuartiles asignados "'Grupos de cuartiles Asignados'"
                let headers = v.data.headers;
                if(headers.indexOf('Grupos de cuartiles Asignados') === -1){
                    headers.push('Grupos de cuartiles Asignados');
                } 

                let users = v.data.rows;
                for(let u = 0; u < users.length; u++){
                    let user = users[u];
                    if(user.DNI.value !== undefined && user.DNI.value == userId) {
                        if(user['Grupos de cuartiles Asignados'] !== undefined && user['Grupos de cuartiles Asignados'].value !== undefined){
                            user['Grupos de cuartiles Asignados'].value += ` + ${groupName}`;
                        }else if(!user['Grupos de cuartiles Asignados']){
                            user['Grupos de cuartiles Asignados'] = {value: groupName, style: ""}
                        }
                    }
                }
            }
        })
    },
    init(){
        this.file           = "";
        this.oldData        = [];
        this.newData        = [];
        this.groups         = [];
        this.assignedUsers  = [];
        this.totalUsers     = [];
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
    /**
     * Funcion que trae los dni de los usuarios con ese cuartil (Perdon por la piramide de codigo :D)
     * @param {Object} cuartil 
     */
    usersToCuartil(cuartil){
        if(!cuartil) return false;
        let QC      = `Q${cuartil.Q}`;
        cuartil = `#Quartil ${cuartil.cuartil}`;

        let returnData = [];
        // Buscamos los usuarios que tengan este cuartil con este Q
        this.newData.map(v => {
            if(v.name !== 'Grupos de perfilamiento' && v.name !== 'Cuartiles'){
                let users = v.data.rows;
                for(let u = 0; u < users.length; u++){
                    for(let h in users[u]){
                        if(h === cuartil && users[u][h].value === QC){
                            returnData.push(users[u]['DNI'].value)
                        }
                    }
                }
            }
        })

        return returnData;
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
                        // Asignamos los DNIs a los usuarios existentes 
                        if(header === 'DNI' && this.totalUsers.indexOf(user[header]) === -1){
                            this.totalUsers.push(user[header])
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
    },
    async getUsersbyGC(group){
        let returnData = [];

        this.oldData.map(v => {
            if(v.name !== 'Grupos de perfilamiento' && v.name !== 'Cuartiles'){
                for(let u = 0; u < v.data.rows.length; u++){
                    let actualUser = v.data.rows[u];

                    let groups = actualUser['Grupos de cuartiles Asignados'].split(' + '); // Separamos los grupos en caso que tenga mas de uno
                    
                    groups.map(e => {
                        if(e === group){
                            returnData.push(actualUser.DNI);
                        }
                    })
                }
            }
        })
        return returnData
    },
    async getPerfilamientos(fileId, getUsers = false) {
        if(!fileId) throw new Error('ID del archivo no especificado');
        this.init()
        let c = await includes.files.checkExist(fileId);
        if(!c) throw new Error("Archivo inexistente")
        this.file = c;

        c = await includes.XLSX.XLSXFile.getData(this.file);
        this.oldData = c;
        let returnData = []

        let groupsCuartiles = []
        this.oldData.map(v => {
            if(v.name === 'Grupos de perfilamiento'){
                groupsCuartiles = v.data.rows;
            }
        })

        for(let x = 0; x < groupsCuartiles.length; x++){
            let grupo = groupsCuartiles[x];
            let tempData = {
                name: grupo['Nombre del grupo'],
                AssignAllUsers: grupo.assignAllUsers === 'SI' ? true : false,
                cluster: grupo.Cluster,
                agentes: {
                    count: grupo['Cant de agentes'],
                    '%_Total': grupo['% Total']
                },
                cuartilAssign: []
            }

            if(getUsers){
                tempData.usersAssign = await this.getUsersbyGC(grupo['Nombre del grupo'])
            }

            for(let h in grupo){
                // Evitamos las columnas por defecto, se entiende que las que no estan aca son cuartiles
                if(h == 'id' || h == 'Nombre del grupo' || h == 'assignAllUsers' || h == 'Cluster' || h == '% Total' || h == 'Cant de agentes') continue;

                let value = grupo[h].split(' + ');
                for(let v = 0; v < value.length; v++){
                    let nivelCuartil = parseInt(value[v].substr(1,1)) // Quitamos la Q inicial
                    tempData.cuartilAssign.push({
                        cuartil: h,
                        Q: nivelCuartil
                    })
                }
            }
            returnData.push(tempData)
        }

        return returnData;
    }
}

module.exports = cuartilesGroups;