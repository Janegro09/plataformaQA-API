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


var migrations = function() {
    usersTable();
    Files();   
    Permissions();
    Roles();
    Groups();
}

module.exports = migrations;