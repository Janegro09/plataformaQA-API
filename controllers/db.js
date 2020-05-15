const mysql         = require('mysql');
const mongoose      = require('mongoose');
const dotenv        = require('dotenv');
const helper        = require('./helper');
const configFile    = helper.configFile();

function getAuthData() {
    dotenv.config();
    let dbConfig = {};
    if(process.env.ENVRIORMENT == 'development'){
        dbConfig      = configFile.developmentDB;
    }else{
        dbConfig      = configFile.productionDB;
    }
    return dbConfig;
}

var mysqld = {
    connect: () => {
        let dbConfig = getAuthData();
        let c = mysql.createConnection(dbConfig.mysql);
        c.connect();
        return c;
    },
    query: async function(sql){
        return new Promise((res, rej) => {
            let connection = mysqld.connect();
            connection.query(sql, (err, result) => {
                if(err){
                    rej(err);
                }else{
                    connection.end();
                    res(result);
                }
            });
        })

    },
    /**
     * Metodo utilizado para crear tablas en MYSQL
     * @param {string} tableName 
     * @param {object} data = puede especificar los siguientes parametros
     *  {
     *      type: VARCHAR|60 --> string required,
     *      notNull: false   --> boolean (true si permite no permites valores nulos),
     *      default: false   --> any (false si no tiene default, y si lleva se especifica ahi mismo),
     *      AI: true         --> boolean (true si es un valor autoincremental),
     *      PK: true         --> boolean (true si es primary key),
     *      unique: true     --> boolean (true si lleva unicamente valores unicos),
     *  }
     * 
     * @example helper.mysqld.createTable('migrations',{
    //     id: {
    //         type: 'int',
    //         notNull: false,
    //         default: false,
    //         AI: true,
    //         PK: true,
    //         unique: true
    //     },
    //     name: {
    //         type: 'varchar|60'
    //     },
    //     creada: {
    //         type: 'BOOLEAN',
    //         default: 'false'
    //     }
    // })
     */
    createTable: function(tableName, data){
        return new Promise((res, rej) => {
            let sql     = `CREATE TABLE IF NOT EXISTS ${tableName}(`;
            let columns = "";
            let count      = 1;
            for(columnName in data){
                columns = "";
                if(count > 1){
                    columns += ", "; 
                }
                columns += columnName + " ";
                if(data[columnName].type == undefined){
                    rej('Error, falta especificar parametro TYPE al crear la tabla');
                }
                type = data[columnName].type.split('|');
                if(type[1] != undefined){
                    columns += `${type[0].toUpperCase()}(${type[1]}) `;
                }else{
                    columns += `${type[0].toUpperCase()} `;
                }
                if(type[0].toUpperCase() != 'TIMESTAMP'){
                    if(data[columnName].notNull != undefined && data[columnName].notNull === true){
                        columns += `NOT NULL `;
                    }
                    if(data[columnName].unique != undefined && data[columnName].unique === true){
                        columns += `UNIQUE `;
                    }
                    if(type[0].toUpperCase() != 'BOOLEAN'){
                        if((data[columnName].default != undefined && data[columnName].default != false) && data[columnName].default != ""){
                            defaultValue = typeof(data[columnName].default) == 'string' ? `'${data[columnName].default}'` : `${data[columnName].default}`;
                            columns += `DEFAULT ${defaultValue} `;
                        }
                    }else{
                        if((data[columnName].default != undefined && data[columnName].default != false) && data[columnName].default != ""){
                            defaultValue = data[columnName].default == 'false' ? false : true;
                            columns += `DEFAULT ${defaultValue} `;
                        }
                    }
                    if(data[columnName].AI != undefined && data[columnName].AI === true){
                        columns += `AUTO_INCREMENT `;
                    }
                    if(data[columnName].PK != undefined && data[columnName].PK === true){
                        columns += `PRIMARY KEY `;
                    }
                }else{
                    if(data[columnName].update != undefined && data[columnName].update === true){
                        columns += `on update CURRENT_TIMESTAMP `;
                    }
                    columns += `NOT NULL DEFAULT CURRENT_TIMESTAMP `;
                }

                if(columns.substr(columns.length - 1,1) == ""){
                }
                sql += columns.substr(0,columns.length - 1);
                count++;
            }
            sql += `) ENGINE = 'InnoDB'`;
            mysqld.query(sql).then((v) => {
                res(v);
            }).catch((e) => {
                rej(e);
            });
        })

    },
    /**
     * 
     * @param {string} tableName 
     * @param {object} value 
     * 
     * @example helper.mysqld.insertOn('migrations',{
     *      name: 'Otro'
     * })
     */
    insertOn: function(tableName, value){
        let sql = "";
        let columns = "INSERT INTO `"+tableName+"` (";
        let values  = " VALUES (";
        let i = 1;
        obj_length = helper.objectSize(value);
        for(key in value){
            if(i < obj_length){
                columns += key+",";
                values  += typeof(value[key] === 'string') ? value[key] === 'true' ? true + "," : value[key] === 'false' ? false + "," : "'" + value[key] + "'," : value[key] + ",";
            }else if(i == obj_length){
                columns += key+")";
                values  += typeof(value[key] === 'string') ? value[key] === 'true' ? true + ")" : value[key] === 'false' ? false + ")" : "'" + value[key] + "')" : value[key] + ")";
            }
            i++;
        }
        sql = columns + values;
        return new Promise((res, rej) => {
            mysqld.query(sql).then((v) => {
                res(v);
            }).catch((e) => {
                rej(e);
            })
        })
    },
    /**
     * 
     * @param {string} tableName 
     * @param {string} values 
     * @param {string} where 
     * 
     * @example helper.mysqld.selectOn('migrations','*',' WHERE id = 1').then((v) => {
                                            console.log(v);
                                        }).catch((e) => {
                                            console.log(e);
                                        })   
                                        helper.mysqld.insertOn('migrations',{
                                            name: 'Ramiroooo'
                                        });
     * 
     * @returns {Array}
     */
    selectOn: async function(tableName, values = "*", where = ""){
        let sql     = `SELECT ${values} FROM ${tableName}${where}`;
        return await mysqld.query(sql);
    },
    /**
     * 
     * @param {string} tableName 
     * @param {object} value 
     * @param {object} where 
     * 
     * @example helper.mysqld.updateOn('migrations',{
                                name: 'Maxi La Soga'
                            }, {id: 1}).then((v) => {
                                console.log(v);
                            }).catch((e) => {
                                console.log(e);
                            })
     * 
     * @returns {Array}
     */
    updateOn: function(tableName, value, where){
        let sql = "UPDATE "+ tableName;
        let set = " SET ";
        let whe = " WHERE ";
        let k = 1;
        let i = 1;
        set_length = helper.objectSize(value);
        whe_length = helper.objectSize(where);
        for(key in value){
            if(i < set_length){
                set += typeof(value[key]) == 'string' ? key + " = '" + value[key] + "'," : key + " = " + value[key] + ",";
            }else if(i == set_length){
                set += typeof(value[key]) == 'string' ? key + " = '" + value[key] + "'": key + " = " + value[key];
            }
            i++
        }

        for(key in where){
            if(k < whe_length){
                whe += typeof(where[key]) == 'string' ? key + " = '" + where[key] + "' AND " : key + " = " + where[key] + " AND ";
            }else if(k == whe_length){
                whe += typeof(where[key]) == 'string' ? key + " = '" + where[key] + "'" : key + " = " + where[key] + ";";
            }
            k++
        }
        sql += set + whe;
        return new Promise((res, rej) => {
            mysqld.query(sql).then((v) => {
                mysqld.selectOn(tableName,'*',whe).then((r) => {
                    res(r);
                }).catch((b) => {
                    rej(b);
                })
            }).catch((e) => {
                rej(e);
            })
        })
    },
    deleteOn: function(tableName, where){
        return new Promise((res,rej) => {
            if(helper.objectSize(where) == 0){
                rej();
            }
            let s = `DELETE FROM ${tableName} WHERE `;
            for(x in where){
                w = "";
                w += `${x} =`;
                if(typeof(where[x]) == 'string'){
                    w += ` '${where[x]}'`;
                }else{
                    w += ` ${where[x]}`;
                }
                s += w;
            }
            mysqld.query(s).then((v) => {
                res(v);
            }).catch((e) => {
                rej(e);
            })
        })

    },
}

module.exports = {
    getData: getAuthData,
    mysql: mysqld
};