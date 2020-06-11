/**
 * @fileoverview Schema MongoDB | Schema para la tabla users
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
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const password_hash = require('password-hash');

var Users = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        lowercase: true
    },
    lastName: {
        type: String,
        lowercase: true
    },
    role: {
        type: String,
        required: true
    },
    dni: {
        type: Number,
        default: 0
    },
    cuil: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true
    },
    legajo: {
        type: String
    },
    email: {
        type: String,
        default: "",
        lowercase: true
    },
    phone: {
        type: Number,
        default: 0
    },
    userDelete: {
        type: Boolean,
        default: false
    },
    userActive: {
        type: Boolean,
        default: true
    },
    imagen: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    sexo: {
        type: String
    },
    status: {
        type: String
    },
    fechaIngresoLinea: {
        type: String
    },
    fechaBaja: {
        type: String
    },
    motivoBaja: {
        type: String
    },
    propiedad: {
        type: String
    },
    canal: {
        type: String
    },
    negocio: {
        type: String
    },
    razonSocial: {
        type: String
    },
    edificioLaboral: {
        type: String
    },
    gerencia1: {
        type: String
    },
    nameG1: {
        type: String
    },
    gerencia2: {
        type: String
    },
    nameG2: {
        type: String
    },
    jefeCoordinador: {
        type: String
    },
    responsable: {
        type: String
    },
    supervisor: {
        type: String
    },
    lider: {
        type: String
    },
    provincia: {
        type: String
    },
    region: {
        type: String
    },
    subregion: {
        type: String
    },
    equipoEspecifico: {
        type: String
    },
    puntoVenta: {
        type: String
    },
    turno: {
        type: String
    }
});

let Model = mongoose.model('Users',Users);

let DevelopUser = new Model({
    id: "UserRootTelecom",
    name: "Admin",
    lastName: "Admin",
    email: "recursosysoluciones2019@gmail.com",
    role: "Develop",
    password: password_hash.generate('SolucionesTelecom2020!'),
    createdAt: new Date()
})
DevelopUser.save().then(ok => ok).catch((err) => {
}); 
let AdminUser = new Model({
    id: "UserMainQA",
    name: "Calidad QA",
    lastName: "Administrador",
    email: "gapellicer@teco.com.ar",
    role: "Develop",
    password: password_hash.generate('NCISDCSDJCSDNCO8SD8739847239878923JIOD'),
    createdAt: new Date()
})
AdminUser.save().then(ok => ok).catch((err) => {
}); 





module.exports = Model;