'use strict'

const helper = require('./helper');
const fs     = require('fs');
const filesModel = require('../database/migrations/Files');

class uploadFile {
    constructor(req){
        this.url = req.originalUrl;
        this.url = this.url.split('/')[3];
        this.file = req.files;
    }

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

    static upload() {

    }

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