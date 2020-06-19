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
const cfile     = helper.configFile();

class uploadFile {
    constructor(req){
        this.url = req.originalUrl;
        this.url = this.url.split('/')[3];
        this.file = req.files;
    }

    /**
     * Valida que el archivo subido no sea mayor a 3MB, y lo guarda en la carpeta ../files/nombrederoute/tipodearchivo/fileName.fileType
     * 
     * @example
     *  Se sube un archivo text/csv desde la route /users entonces el archivo esta almacenado en:
     * ../files/users/text/xmskjn9832hu42ui4hiu2j432k42.csv
     */
    async save() {
        let folder = '../files/';
        if(!helper.files.exists(`${folder}${this.url}`,true)){
            // Creamos la carpeta 
            fs.mkdirSync(`${folder}${this.url}`);
        }
        let typeFile, file, saveFile, fileData;
        for(let x in this.file){
            file = this.file[x]
            typeFile = (file.mimetype.split('/'))
            if(file.size > 31425728) return false; // Valida si el archivo es mayor a 3MB
            if(!helper.files.exists(`${folder}${this.url}/${typeFile[0]}`,true)){
                try{
                    fs.mkdirSync(`${folder}${this.url}/${typeFile[0]}`);
                }catch {
                    return false;
                }
            }
            let saveFile = `${folder}${this.url}/${typeFile[0]}/`;
            fileData = {
                url: `${this.url}/${typeFile[0]}/`,
                type: file.mimetype,
                name: ""
            }
            // Consultamos si existe una imagen con ese nombre
            for(let x = 0; x < 5; x++){
                fileData.name += Math.random().toString(36).replace(/[^a-z]+/g, '');
            }
            fileData.name += `.${typeFile[1]}`;
            fileData.url += fileData.name;
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

    /**
     * Funcion para guardar el archivo y almacenar su ubicacion en la base de datos
     * @param {String} section 
     * @param {String} type 
     * @param {String} fileName 
     */
    static async getIdSaveFile(section, type, fileName) {
        if(!section || !type || !fileName) return false;
        let tempData = {
            path: `${global.baseUrl}/../files/${section}/${type}/${fileName}`,
            type: type,
            name: fileName
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
     * Traemos la url de un archivo 
     * example:       
     * 
     *  files.getFileURL(req, '5eecfd79f5bcdf5913decda5').then(v => {
            console.log(v)
        }, err => {
            console.log(err)
        })

     * @param {Object} req 
     * @param {String} fileID 
     */
    static async getFileURL(req, fileID) {
        if(!req || !fileID) throw new Error('Error en los parametros')
        let URL = req.get('host') + cfile.mainInfo.routes + '/files';

        console.log(URL);
        return true;
        
        // Consultamos si existe el registro
        let c = await filesModel.find({_id: fileID});
        if(c.lenght == 0) return false
        
        let filePath = c[0].path;
        // Comprobamos que el archivo exista
        if(!helper.files.exists(filePath)) {
            // Eliminamos el registro
            await filesModel.deleteOne({_id: fileID});
            return false;
        }else{
            filePath = filePath.split('/');

            // Buscamos la carpeta files
            let filesFolderIndex = filePath.indexOf('files') + 1;
            for(let i = filesFolderIndex; i < filePath.length; i++){
                if(filePath[i]){
                    URL += '/' + filePath[i];
                }
            }
            return URL;
        }
    }

    /**
     * Elimina el archivo que se subio y borra el registro de la base de datos
     */
    async delete() {
        let id = this.uploadFile.id;
        return new Promise((res, rej) => {
            filesModel.findById(id).then((v) => {
                helper.files.delete('../files/' + v.url);
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