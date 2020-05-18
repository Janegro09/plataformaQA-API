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
        required: true,
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
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
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
    }
});

let Model = mongoose.model('Users',Users);

let AdminUser = new Model({
    id: "UserRootTelecom",
    name: "Admin",
    lastName: "Admin",
    email: "recursosysoluciones@gmail.com",
    role: "Develop",
    password: password_hash.generate('SolucionesTelecom2020!'),
    createdAt: new Date()
})
AdminUser.save().then(ok => ok).catch((err) => {
}); 



module.exports = Model;