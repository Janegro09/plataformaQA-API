/**
 * @fileoverview Archivo principal de migraciones
 * 
 * Este archivo iniciara cada schema y creara el modelo de mongodb o la tabla de MySQL
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
const helper    = require('../../controllers/helper');
const db        = require('../../controllers/db');
const mongoose  = require('mongoose');
const Schema    = mongoose.Schema;


// Users tables
const usersTable    = require('./usersTable');
const Files         = require('./Files');
const Permissions   = require('./Permissions');
const Roles         = require('./Roles');
const Groups        = require('./groups');
const groupsPerUser = require('./groupsperuser');


var migrations = function() {
    usersTable();
    Files();   
    Permissions();
    Roles();
    Groups();
    groupsPerUser();
}

module.exports = migrations;