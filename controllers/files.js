/**
 * @fileoverview Type: Controller | Controlador de archivos
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

// Incluimos controladores, modelos, schemas y modulos
'use strict'

const helper = require('./helper');
const fs     = require('fs');
const filesModel = require('../database/migrations/Files');
const tempURLs   = require('../database/migrations/tempURLs');
const cfile     = helper.configFile();

class uploadFile {
    constructor(req){
        if(typeof req == 'string'){
            // Estamos enviando un id
            this.uploadFile = {
                id: req
            }
        }else {
            this.url = req.originalUrl;
            this.url = this.url.split('/')[3];
            this.file = req.files;
        }
    }

    /**
     * Valida que el archivo subido no sea mayor a 3MB, y lo guarda en la carpeta ../files/nombrederoute/tipodearchivo/fileName.fileType
     * 
     * @example
     *  Se sube un archivo text/csv desde la route /users entonces el archivo esta almacenado en:
     * ../files/users/text/xmskjn9832hu42ui4hiu2j432k42.csv
     */
    async save() {
        let folder = global.baseUrl + '/../files/';
        if(!helper.files.exists(`${folder}${this.url}`,true)){
            // Creamos la carpeta 
            fs.mkdirSync(`${folder}${this.url}`, "0755");
        }
        let typeFile, file, saveFile, fileData;
        for(let x in this.file){
            file = this.file[x]
            typeFile = (file.mimetype.split('/'))
            // if(file.size > 31425728) return false; // Valida si el archivo es mayor a 3MB
            // Folder name
            switch(typeFile[1]) {
                case "vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                    typeFile[0] = "xlsx";
                    typeFile[1] = "xlsx";
                    break;     
                case "wave": 
                    typeFile[1] = 'wav'; // Cambiamos el archivo para que no sea .wave 
                    break;
                default:
                    break;       
            } 


            if(!helper.files.exists(`${folder}${this.url}/${typeFile[0]}`,true)){
                try{
                    fs.mkdirSync(`${folder}${this.url}/${typeFile[0]}`, '0755');
                }catch {
                    return false;
                }
            }
            let saveFile = `${folder}${this.url}/${typeFile[0]}/`;
            fileData = {
                path: saveFile,
                type: file.mimetype,
                name: ""
            }
            // Consultamos si existe una imagen con ese nombre
            for(let x = 0; x < 5; x++){
                fileData.name += Math.random().toString(36).replace(/[^a-z]+/g, '');
            }
            fileData.name += `.${typeFile[1]}`;
            fileData.path += fileData.name;
            saveFile += fileData.name;
            // // Validaciones de seguridad para imagen
            try{
                await file.mv(saveFile)
                saveFile = new filesModel(fileData)
                await saveFile.save()
                fileData.id = saveFile._id;
                this.uploadFile = fileData;
                return fileData;
            }catch{
                return false;
            }

        }
    }

    static async checkExist(fileId) {
        if(!fileId) return false;

        let c = await filesModel.find({_id: fileId});
        if(c.length > 0) {
            return c[0];
        }else {
            return false;
        }
    }

    /**
     * Funcion para crear un registro de un archivo que se guardo en otra parte de la API, como por ejemplo cuando se crea un archivo XLSX
     * @param {String} section 
     * @param {String} type 
     * @param {String} fileName 
     */
    static async getIdSaveFile(section, type, fileName) {
        if(!section || !type || !fileName) return false;
        let tempData = {
            path: `${global.baseUrl}/../files/${section}/${type}/${fileName}`,
            type: type,
            name: fileName,
            section: section
        }

        try{
            let saveFile = new filesModel(tempData)
            await saveFile.save()
            tempData.id = saveFile._id;
            return tempData;
        } catch {
            return false;
        }
    }

    /**
     * Funcion para obtener una URL Temporal
     * @param {String} fileID 
     */
    static async getTempURL(fileID) {
        if(!fileID) return false;
        
        // Buscamos si existe el archivo
        let c = await filesModel.find({_id: fileID});
        if(c.length === 0) return false;
        else {
            let path = c[0].path;
            if(!helper.files.exists(path)){
                // Eliminamos el registro
                c = await filesModel.deleteOne({_id: fileID});
                return false;
            }
        }
        // Creamos URL Temporal
        c = new tempURLs({
            fileId: fileID
        })
        let query = await c.save();
        
        return c._id
    }

    /**
     * Esta funcion devuelve el id del archivo y elimina el registro
     */
    static async getFileID(tempId) {
        if(!tempId) return false;
        let idReturn = false;
        
        // buscamos la url temporal
        let c = await tempURLs.find({_id: tempId});
        if(c.length === 0) return false;

        idReturn = c[0].fileId;

        // Eliminamos la url temporal ya que solo tiene validez de 1 uso
        c = await tempURLs.deleteOne({_id: c[0]._id});
        return idReturn;
    }

    /**
     * Funcion que devuelve los registros de la base de datos ordenados por fecha en orden DESC
     * @param {Object} where 
     */
    static async getAllFiles(where = {}) {
        let c = await filesModel.find(where).sort({updatedAt: 'desc'});

        return c;
    }

    /**
     * Elimina el archivo que se subio y borra el registro de la base de datos
     */
    async delete() {
        let id = this.uploadFile.id;
        return new Promise((res, rej) => {
            filesModel.findById(id).then((v) => {
                helper.files.delete(v.path);
                filesModel.deleteOne({_id: id}).then((r) => {
                    if(r.deletedCount > 0) res(true);
                    else res(false)
                })
            }).catch((e) => {
                res(false);
            })
        })
    }
}

module.exports = uploadFile;