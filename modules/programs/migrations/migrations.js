/**
 * @fileoverview Modulo Programs
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


// Tables 
const groupsByUsers     = require('./groupsByUsers.table');
const programs          = require('./programs.table');
const programsByGroups  = require('./programsByGroups.table');
const programsGroups    = require('./programsGroups.table');

module.exports = function() {
    groupsByUsers();
    programs();
    programsByGroups();
    programsGroups();
}();